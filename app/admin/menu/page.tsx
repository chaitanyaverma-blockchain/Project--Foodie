'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, X, ToggleLeft, ToggleRight, PlusCircle, Settings2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { FoodItem, Category, FoodOption, FoodOptionValue } from '@/types';
import { Button } from '@/components/ui/Button';
import { FloatingInput, FloatingTextarea } from '@/components/ui/Input';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { DietBadge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

type DraftOptionValue = { id?: string; value: string; price_modifier: number; is_available: boolean; sort_order: number };
type DraftOption = { id?: string; name: string; type: 'single' | 'multiple'; is_required: boolean; sort_order: number; values: DraftOptionValue[] };

export default function AdminMenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FoodItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const EMPTY_FORM = {
    name: '',
    description: '',
    category_id: '',
    price: 0,
    sale_price: null as number | null,
    is_veg: true,
    is_egg: false,
    calories: null as number | null,
    image_url: null as string | null,
    status: 'active' as 'active' | 'inactive',
    stock_status: 'available' as 'available' | 'sold_out',
    is_drink: false,
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [draftOptions, setDraftOptions] = useState<DraftOption[]>([]);

  useEffect(() => {
    // Fetch food items via admin API (bypasses RLS)
    Promise.all([
      fetch('/api/admin/food-items').then(r => r.json()),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([itemsData, catsRes]) => {
      setItems(Array.isArray(itemsData) ? itemsData as FoodItem[] : []);
      setCategories((catsRes.data ?? []) as Category[]);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setDraftOptions([]);
    setModalOpen(true);
  };

  const openEdit = (item: FoodItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description ?? '',
      category_id: item.category_id ?? '',
      price: item.price,
      sale_price: item.sale_price,
      is_veg: item.is_veg,
      is_egg: item.is_egg,
      calories: item.calories,
      image_url: item.image_url,
      status: item.status,
      stock_status: item.stock_status,
      is_drink: item.dietary_tags?.includes('drink') ?? false,
    });
    
    // Map existing options to draft format
    const existingOptions = (item.food_options ?? []).map(opt => ({
      id: opt.id,
      name: opt.name,
      type: opt.type,
      is_required: opt.is_required,
      sort_order: opt.sort_order,
      values: (opt.food_option_values ?? []).map(val => ({
        id: val.id,
        value: val.value,
        price_modifier: val.price_modifier,
        is_available: val.is_available,
        sort_order: val.sort_order,
      })).sort((a, b) => a.sort_order - b.sort_order)
    })).sort((a, b) => a.sort_order - b.sort_order);
    
    setDraftOptions(existingOptions);
    setModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('food-media')
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error('Failed to upload image.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('food-media').getPublicUrl(data.path);
    setForm((p) => ({ ...p, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success('Image uploaded!');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => files[0] && handleImageUpload(files[0]),
  });

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required.');
      return;
    }
    setSaving(true);

    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const payload = { 
      ...form, 
      slug, 
      tags: [],
      dietary_tags: form.is_drink ? ['drink'] : []
    };
    delete (payload as any).is_drink;

    try {
      if (editItem) {
        // Update via admin API
        const res = await fetch('/api/admin/food-items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editItem.id, ...payload, options: draftOptions }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || 'Failed to update'); setSaving(false); return; }
        setItems((prev) => prev.map((i) => i.id === editItem.id ? data as FoodItem : i));
        toast.success('Item updated!');
      } else {
        // Create via admin API
        const res = await fetch('/api/admin/food-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, options: draftOptions }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || 'Failed to create'); setSaving(false); return; }
        setItems((prev) => [data as FoodItem, ...prev]);
        toast.success('Item created!');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    }

    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (item: FoodItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const res = await fetch('/api/admin/food-items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
    if (!res.ok) { toast.error('Delete failed'); return; }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success('Item deleted.');
  };

  const toggleStock = async (item: FoodItem) => {
    const newStatus = item.stock_status === 'available' ? 'sold_out' : 'available';
    // @ts-expect-error Supabase types issue
    await supabase.from('food_items').update({ stock_status: newStatus }).eq('id', item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, stock_status: newStatus } : i));
  };
  
  // Dynamic Variant Handlers
  const addOptionGroup = () => {
    setDraftOptions([...draftOptions, { name: '', type: 'single', is_required: false, sort_order: draftOptions.length, values: [] }]);
  };
  
  const removeOptionGroup = (index: number) => {
    setDraftOptions(draftOptions.filter((_, i) => i !== index));
  };
  
  const addOptionValue = (optIndex: number) => {
    const newOpts = [...draftOptions];
    newOpts[optIndex].values.push({ value: '', price_modifier: 0, is_available: true, sort_order: newOpts[optIndex].values.length });
    setDraftOptions(newOpts);
  };
  
  const removeOptionValue = (optIndex: number, valIndex: number) => {
    const newOpts = [...draftOptions];
    newOpts[optIndex].values = newOpts[optIndex].values.filter((_, i) => i !== valIndex);
    setDraftOptions(newOpts);
  };

  return (
    <div>
      {/* ── Page Header Row ─────────────────────────────────── */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Admin / Menu</p>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Menu Management
            <span className="ml-2 text-sm font-semibold text-gray-400">({items.length} items)</span>
          </h1>
        </div>
        <button
          id="add-menu-item-btn"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF7A1A 100%)', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}
        >
          <Plus className="w-4 h-4" />
          Add New Dish
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 shimmer" />
            ))
          : items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="relative h-36 bg-gray-100">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <DietBadge type={item.is_veg ? 'veg' : item.is_egg ? 'egg' : 'non-veg'} />
                    {item.food_options && item.food_options.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-gray-700 border border-gray-200 flex items-center gap-1 shadow-sm">
                        <Settings2 className="w-3 h-3" /> Configurable
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.stock_status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.stock_status === 'available' ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{(item.categories as unknown as Category)?.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FF6B00]">{formatPrice(item.price)}</span>
                    <div className="flex gap-2">
                      <button
                        id={`toggle-stock-${item.id}`}
                        onClick={() => toggleStock(item)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        title="Toggle stock"
                      >
                        {item.stock_status === 'available'
                          ? <ToggleRight className="w-5 h-5 text-green-600" />
                          : <ToggleLeft className="w-5 h-5 text-red-500" />}
                      </button>
                      <button
                        id={`edit-item-${item.id}`}
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors text-gray-500 hover:text-[#FF6B00]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-item-${item.id}`}
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <DialogHeader title={editItem ? 'Edit Menu Item' : 'Add Menu Item'} onClose={() => setModalOpen(false)} />
        <DialogBody>
          <div className="space-y-6">
            <div className="space-y-5">
              <h3 className="font-bold text-[#1A1A1A] border-b pb-2">Basic Info</h3>
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dish Photo</label>
                {form.image_url ? (
                  <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                    <Image src={form.image_url} alt="dish" fill className="object-cover" />
                    <button
                      onClick={() => setForm((p) => ({ ...p, image_url: null }))}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-orange-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'animate-bounce text-[#FF6B00]' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-500">
                      {uploading ? 'Uploading...' : 'Drop image here or click to upload'}
                    </p>
                  </div>
                )}
              </div>

              <FloatingInput label="Dish Name *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <FloatingTextarea label="Description" value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />

              <div className="grid grid-cols-2 gap-4">
                <FloatingInput label="Base Price (₹) *" type="number" value={String(form.price)} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
                <FloatingInput label="Sale Price (₹)" type="number" value={String(form.sale_price ?? '')} onChange={(e) => setForm((p) => ({ ...p, sale_price: e.target.value ? Number(e.target.value) : null }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FloatingInput label="Calories" type="number" value={String(form.calories ?? '')} onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value ? Number(e.target.value) : null }))} />
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Diet Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Diet Type</label>
                <div className="flex gap-3">
                  {[
                    { key: 'veg', label: '🟢 Veg', active: form.is_veg && !form.is_egg && !form.is_drink },
                    { key: 'non-veg', label: '🔴 Non-Veg', active: !form.is_veg && !form.is_egg && !form.is_drink },
                    { key: 'egg', label: '🟡 Egg', active: form.is_egg && !form.is_drink },
                    { key: 'drink', label: '🥤 Drink', active: form.is_drink },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        if (opt.key === 'veg') setForm((p) => ({ ...p, is_veg: true, is_egg: false, is_drink: false }));
                        else if (opt.key === 'non-veg') setForm((p) => ({ ...p, is_veg: false, is_egg: false, is_drink: false }));
                        else if (opt.key === 'egg') setForm((p) => ({ ...p, is_veg: false, is_egg: true, is_drink: false }));
                        else setForm((p) => ({ ...p, is_veg: false, is_egg: false, is_drink: true }));
                      }}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        opt.active ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Variant Creator */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">Variants & Add-ons</h3>
                  <p className="text-xs text-gray-500">Add options like Sizes, Crust Type, or Extra Toppings</p>
                </div>
                <Button size="sm" variant="outline" onClick={addOptionGroup} type="button">
                  <PlusCircle className="w-4 h-4 mr-1" /> Add Group
                </Button>
              </div>

              {draftOptions.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">No variants added.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {draftOptions.map((optGroup, optIndex) => (
                    <div key={optIndex} className="bg-gray-50 dark:bg-[#1A1E27] rounded-xl p-4 border border-gray-100 dark:border-[#353B46] relative group">
                      <button 
                        onClick={() => removeOptionGroup(optIndex)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-12 gap-3 mb-4 pr-6">
                        <div className="col-span-12 sm:col-span-6">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Group Name</label>
                          <input 
                            className="w-full px-3 py-2 border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-lg text-sm text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF6B00]"
                            placeholder="e.g. Size, Crust, Toppings"
                            value={optGroup.name}
                            onChange={(e) => {
                              const newOpts = [...draftOptions];
                              newOpts[optIndex].name = e.target.value;
                              setDraftOptions(newOpts);
                            }}
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-lg text-sm text-text-primary focus:outline-none focus:border-[#FF6B00]"
                            value={optGroup.type}
                            onChange={(e) => {
                              const newOpts = [...draftOptions];
                              newOpts[optIndex].type = e.target.value as 'single' | 'multiple';
                              setDraftOptions(newOpts);
                            }}
                          >
                            <option value="single">Single Choice</option>
                            <option value="multiple">Multiple Choice</option>
                          </select>
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Required?</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-lg text-sm text-text-primary focus:outline-none focus:border-[#FF6B00]"
                            value={String(optGroup.is_required)}
                            onChange={(e) => {
                              const newOpts = [...draftOptions];
                              newOpts[optIndex].is_required = e.target.value === 'true';
                              setDraftOptions(newOpts);
                            }}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {optGroup.values.map((val, valIndex) => (
                          <div key={valIndex} className="flex items-center gap-2">
                            <input 
                              className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-lg text-sm text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF6B00]"
                              placeholder="Option Value (e.g. Large)"
                              value={val.value}
                              onChange={(e) => {
                                const newOpts = [...draftOptions];
                                newOpts[optIndex].values[valIndex].value = e.target.value;
                                setDraftOptions(newOpts);
                              }}
                            />
                            <div className="relative w-32">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                              <input 
                                type="number"
                                className="w-full pl-7 pr-3 py-1.5 border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-lg text-sm text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF6B00]"
                                placeholder="Price Mod."
                                value={val.price_modifier}
                                onChange={(e) => {
                                  const newOpts = [...draftOptions];
                                  newOpts[optIndex].values[valIndex].price_modifier = Number(e.target.value);
                                  setDraftOptions(newOpts);
                                }}
                              />
                            </div>
                            <button 
                              onClick={() => removeOptionValue(optIndex, valIndex)}
                              className="p-1.5 text-gray-400 hover:bg-white hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => addOptionValue(optIndex)}
                          className="text-xs font-bold text-[#FF6B00] hover:underline mt-1 inline-block"
                          type="button"
                        >
                          + Add Option Value
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            loading={saving}
            className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md hover:shadow-lg hover:from-orange-500 hover:to-orange-400 border-none"
          >
            {editItem ? 'Update Menu Item' : 'Add Product'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

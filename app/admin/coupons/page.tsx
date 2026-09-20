'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Tag, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Coupon } from '@/types';
import { Button } from '@/components/ui/Button';
import { FloatingInput } from '@/components/ui/Input';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const EMPTY_FORM = {
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order: 0,
    max_discount: null as number | null,
    max_uses: 100,
    is_active: true,
  };
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCoupons((data ?? []) as Coupon[]);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => { setEditCoupon(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditCoupon(c);
    setForm({ code: c.code, description: c.description ?? '', type: c.type, value: c.value, min_order: c.min_order, max_discount: c.max_discount, max_uses: c.max_uses, is_active: c.is_active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required.'); return; }
    setSaving(true);
    if (editCoupon) {
      // @ts-expect-error Supabase types issue
      const { data, error } = await supabase.from('coupons').update(form as any).eq('id', editCoupon.id).select().single();
      if (error) { toast.error(error.message); }
      else { setCoupons((prev) => prev.map((c) => c.id === editCoupon.id ? data as Coupon : c)); toast.success('Coupon updated!'); }
    } else {
      const { data, error } = await supabase.from('coupons').insert({ ...form, times_used: 0 } as any).select().single();
      if (error) { toast.error(error.message); }
      else { setCoupons((prev) => [data as Coupon, ...prev]); toast.success('Coupon created!'); }
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success('Coupon deleted.');
  };

  const toggleActive = async (coupon: Coupon) => {
    // @ts-expect-error Supabase types issue
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id);
    setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, is_active: !coupon.is_active } : c));
  };

  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Admin / Growth</p>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Coupons & Campaigns
          </h1>
        </div>
        <button
          id="add-coupon-btn"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF7A1A 100%)', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Coupon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 shimmer" />)
          : coupons.map((coupon) => (
              <div key={coupon.id} className={`bg-white rounded-2xl p-5 shadow-card border-l-4 ${coupon.is_active ? 'border-[#FF6B00]' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className={`w-4 h-4 ${coupon.is_active ? 'text-[#FF6B00]' : 'text-gray-400'}`} />
                    <span className="font-mono font-black text-lg text-[#1A1A1A]">{coupon.code}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      id={`toggle-coupon-${coupon.id}`}
                      onClick={() => toggleActive(coupon)}
                      className="text-gray-400 hover:text-[#FF6B00] transition-colors"
                    >
                      {coupon.is_active
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-gray-300" />}
                    </button>
                    <button onClick={() => openEdit(coupon)} className="text-gray-400 hover:text-[#FF6B00] transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {coupon.description && <p className="text-sm text-gray-500 mb-3">{coupon.description}</p>}
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-2.5 py-1 bg-orange-50 text-[#FF6B00] rounded-lg font-bold">
                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </span>
                  {coupon.min_order > 0 && (
                    <span className="text-gray-500 text-xs">Min: {formatPrice(coupon.min_order)}</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <span>{coupon.times_used}/{coupon.max_uses} used</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 bg-[#FF6B00] rounded-full"
                      style={{ width: `${Math.min(100, (coupon.times_used / coupon.max_uses) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogHeader title={editCoupon ? 'Edit Coupon' : 'Create Coupon'} onClose={() => setModalOpen(false)} />
        <DialogBody>
          <div className="space-y-4">
            <FloatingInput label="Coupon Code *" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="font-mono" />
            <FloatingInput label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <FloatingInput label={`Value (${form.type === 'percentage' ? '%' : '₹'})`} type="number" value={String(form.value)} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="Min Order (₹)" type="number" value={String(form.min_order)} onChange={(e) => setForm((p) => ({ ...p, min_order: Number(e.target.value) }))} />
              <FloatingInput label="Max Uses" type="number" value={String(form.max_uses)} onChange={(e) => setForm((p) => ({ ...p, max_uses: Number(e.target.value) }))} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleSave} loading={saving} fullWidth>
              {editCoupon ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

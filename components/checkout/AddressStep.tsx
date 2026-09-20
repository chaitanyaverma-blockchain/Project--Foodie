'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, MapPin } from 'lucide-react';
import { FloatingInput, FloatingTextarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Address } from '@/types';
import toast from 'react-hot-toast';

interface AddressStepProps {
  onNext: (address: Address) => void;
}

const EMPTY_FORM: Partial<Address> = {
  label: 'Home',
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
};

export function AddressStep({ onNext }: AddressStepProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Address>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        const addrs = (data ?? []) as Address[];
        setAddresses(addrs);
        const def = addrs.find((a) => a.is_default) ?? addrs[0];
        if (def) setSelected(def);
        if (addrs.length === 0) setShowForm(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSave = async () => {
    if (!form.full_name || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...form, user_id: user!.id })
      .select()
      .single();

    if (error) {
      toast.error('Failed to save address.');
      setSaving(false);
      return;
    }
    const newAddr = data as Address;
    setAddresses((prev) => [newAddr, ...prev]);
    setSelected(newAddr);
    setShowForm(false);
    setForm(EMPTY_FORM);
    toast.success('Address saved!');
    setSaving(false);
  };

  const handleChange = (field: keyof Address, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-[#1E222B] rounded-2xl p-6 shadow-card">
      <h2 className="font-serif font-bold text-xl mb-6 text-[#1A1A1A] dark:text-white">Delivery Address</h2>

      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3 mb-6">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              id={`address-${addr.id}`}
              onClick={() => { setSelected(addr); setShowForm(false); }}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                selected?.id === addr.id
                  ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-950/20'
                  : 'border-gray-100 dark:border-[#353B46] hover:border-gray-200 dark:hover:border-[#4A4F5A]'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selected?.id === addr.id ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-gray-300'
              }`}>
                {selected?.id === addr.id && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{addr.label}</span>
                  {addr.is_default && (
                    <span className="text-xs bg-orange-50 text-[#FF6B00] px-2 py-0.5 rounded-full font-semibold">Default</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{addr.full_name} · {addr.phone}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add New Address */}
      {!showForm ? (
        <button
          id="add-new-address-btn"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold text-[#FF6B00] hover:underline mb-6"
        >
          <Plus className="w-4 h-4" /> Add new address
        </button>
      ) : (
        <div className="border border-gray-100 dark:border-[#353B46] rounded-xl p-5 mb-6 space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-200">New Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput label="Full Name" value={form.full_name ?? ''} onChange={(e) => handleChange('full_name', e.target.value)} />
            <FloatingInput label="Phone" type="tel" value={form.phone ?? ''} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <FloatingInput label="Address Line 1" value={form.line1 ?? ''} onChange={(e) => handleChange('line1', e.target.value)} />
          <FloatingInput label="Address Line 2 (Optional)" value={form.line2 ?? ''} onChange={(e) => handleChange('line2', e.target.value)} />
          <div className="grid grid-cols-3 gap-4">
            <FloatingInput label="City" value={form.city ?? ''} onChange={(e) => handleChange('city', e.target.value)} />
            <FloatingInput label="State" value={form.state ?? ''} onChange={(e) => handleChange('state', e.target.value)} />
            <FloatingInput label="Pincode" value={form.pincode ?? ''} onChange={(e) => handleChange('pincode', e.target.value)} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving} size="sm">Save Address</Button>
            {addresses.length > 0 && (
              <Button onClick={() => setShowForm(false)} variant="ghost" size="sm">Cancel</Button>
            )}
          </div>
        </div>
      )}

      <Button
        id="proceed-to-payment-btn"
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        size="lg"
        fullWidth
      >
        Proceed to Payment
      </Button>
    </div>
  );
}

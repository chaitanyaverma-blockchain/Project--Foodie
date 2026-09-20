'use client';

import React, { useState } from 'react';
import { User, Phone, MapPin, Globe, Briefcase, Calendar, Lock, LogOut, ChevronDown, Bell, Shield, AlertTriangle } from 'lucide-react';
import { FloatingInput, FloatingTextarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Profile } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface SettingsFormProps {
  profile: Profile;
  onSave: (data: Partial<Profile>) => Promise<void>;
  saving: boolean;
}

export default function SettingsForm({ profile, onSave, saving }: SettingsFormProps) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
    occupation: profile.occupation || '',
    birthday: profile.birthday || '',
    favorite_cuisine: profile.favorite_cuisine || '',
    instagram: profile.social_links?.instagram || '',
    youtube: profile.social_links?.youtube || '',
    github: profile.social_links?.github || '',
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'account'>('personal');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFormSave = () => {
    const payload = {
      ...form,
      social_links: {
        instagram: form.instagram,
        youtube: form.youtube,
        github: form.github,
      }
    };
    onSave(payload);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="mt-8 bg-white dark:bg-[#4E342E] rounded-[24px] shadow-sm border border-[#F5E6D3] dark:border-[#5D4037] overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#F5E6D3] dark:border-[#6D4C41]">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-4 font-bold text-center transition-colors ${
            activeTab === 'personal'
              ? 'text-[#FF6B00] border-b-2 border-[#FF6B00] bg-[#FFF3E0] dark:bg-[#5D4037]'
              : 'text-[#8D6E63] dark:text-[#BCAAA4] hover:bg-gray-50 dark:hover:bg-[#3E2723]'
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-4 font-bold text-center transition-colors ${
            activeTab === 'account'
              ? 'text-[#FF6B00] border-b-2 border-[#FF6B00] bg-[#FFF3E0] dark:bg-[#5D4037]'
              : 'text-[#8D6E63] dark:text-[#BCAAA4] hover:bg-gray-50 dark:hover:bg-[#3E2723]'
          }`}
        >
          Account Settings
        </button>
      </div>

      <div className="p-6 md:p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput id="full_name" label="Full Name" value={form.full_name} onChange={handleChange} icon={<User className="w-5 h-5" />} />
                <FloatingInput id="username" label="Username" value={form.username} onChange={handleChange} icon={<span className="text-gray-400 font-bold">@</span>} />
              </div>
              
              <FloatingTextarea id="bio" label="Bio (Tell us about your food journey)" value={form.bio} onChange={handleChange} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput id="phone" label="Phone Number" value={form.phone} onChange={handleChange} icon={<Phone className="w-5 h-5" />} />
                <FloatingInput id="birthday" type="date" label="Birthday" value={form.birthday} onChange={handleChange} icon={<Calendar className="w-5 h-5" />} />
                <FloatingInput id="location" label="Location" value={form.location} onChange={handleChange} icon={<MapPin className="w-5 h-5" />} />
                <FloatingInput id="occupation" label="Occupation" value={form.occupation} onChange={handleChange} icon={<Briefcase className="w-5 h-5" />} />
                <FloatingInput id="favorite_cuisine" label="Favorite Cuisine" value={form.favorite_cuisine} onChange={handleChange} icon={<span className="text-gray-400">🍲</span>} />
                <FloatingInput id="website" label="Website" value={form.website} onChange={handleChange} icon={<Globe className="w-5 h-5" />} />
              </div>

              <div className="pt-4 pb-2">
                <h3 className="text-lg font-bold text-[#3E2723] dark:text-[#FFF8E1] mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FloatingInput id="instagram" label="Instagram Handle" value={form.instagram} onChange={handleChange} />
                  <FloatingInput id="youtube" label="YouTube Channel" value={form.youtube} onChange={handleChange} />
                  <FloatingInput id="github" label="GitHub Username" value={form.github} onChange={handleChange} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#F5E6D3] dark:border-[#6D4C41]">
                <Button onClick={handleFormSave} loading={saving} size="lg" className="bg-gradient-to-r from-[#FF8A00] to-[#FF6B00] text-white">
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 bg-gray-50 dark:bg-[#3E2723] rounded-xl border border-gray-100 dark:border-[#5D4037] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <div>
                    <h4 className="font-bold text-[#3E2723] dark:text-[#FFF8E1]">Password</h4>
                    <p className="text-sm text-[#8D6E63] dark:text-[#BCAAA4]">Change your password securely</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-[#3E2723] rounded-xl border border-gray-100 dark:border-[#5D4037] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <h4 className="font-bold text-[#3E2723] dark:text-[#FFF8E1]">Two-Factor Authentication</h4>
                    <p className="text-sm text-[#8D6E63] dark:text-[#BCAAA4]">Add an extra layer of security</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 mt-8">
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h4>
                <p className="text-sm text-red-500 dark:text-red-300 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                  Delete Account
                </button>
              </div>

              <div className="pt-8">
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 dark:bg-[#3E2723] text-[#3E2723] dark:text-[#FFF8E1] font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#4E342E] transition-colors">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

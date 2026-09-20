'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { Profile } from '@/types';
import { uploadAvatarAction } from './actions';
import { motion } from 'framer-motion';

// Import New Components
import ProfileHero from '@/components/profile/ProfileHero';
import QuickStats from '@/components/profile/QuickStats';
import CommunityReport from '@/components/profile/CommunityReport';
import ActivityTimeline from '@/components/profile/ActivityTimeline';
import Achievements from '@/components/profile/Achievements';
import TasteProfile from '@/components/profile/TasteProfile';
import FoodImpact from '@/components/profile/FoodImpact';
import MonthlyGoals from '@/components/profile/MonthlyGoals';
import PerformanceInsights from '@/components/profile/PerformanceInsights';
import SettingsForm from '@/components/profile/SettingsForm';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    recipes: 0,
    followers: 0,
    following: 0,
    likes: 0,
    saves: 0,
    comments: 0,
    rating: 4.8,
    orders: 0
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      window.location.href = '/auth/login?next=/profile';
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      
      try {
        const { count: recipesCount } = await supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: followersCount } = await supabase
          .from('recipe_followers')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id);

        const { count: followingCount } = await supabase
          .from('recipe_followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id);

        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { data: userRecipes } = await supabase.from('recipes').select('id').eq('user_id', user.id);
        const recipeIds = (userRecipes as any[])?.map(r => r.id) || [];
        
        let likesCount = 0;
        let savesCount = 0;
        let commentsCount = 0;
        
        if (recipeIds.length > 0) {
          const [{ count: lCount }, { count: sCount }, { count: cCount }] = await Promise.all([
            supabase.from('recipe_likes').select('*', { count: 'exact', head: true }).in('recipe_id', recipeIds),
            supabase.from('recipe_saves').select('*', { count: 'exact', head: true }).in('recipe_id', recipeIds),
            supabase.from('recipe_comments').select('*', { count: 'exact', head: true }).in('recipe_id', recipeIds),
          ]);
          likesCount = lCount || 0;
          savesCount = sCount || 0;
          commentsCount = cCount || 0;
        }

        setStats({
          recipes: recipesCount || 0,
          followers: followersCount || 0,
          following: followingCount || 0,
          likes: likesCount,
          saves: savesCount,
          comments: commentsCount,
          rating: 4.8,
          orders: ordersCount || 0
        });

      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    
    if (user && profile) {
      fetchStats();
    }
  }, [user, profile, supabase]);

  const handleSave = async (data: Partial<Profile>) => {
    if (!user) return;
    setSaving(true);
    const updateData: any = { ...data, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);
      
    if (error) toast.error(error.message);
    else {
      toast.success('Profile updated successfully!');
      setTimeout(() => window.location.reload(), 1000);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadAvatarAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        toast.success('Avatar updated!');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err: any) {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const [uploadingCover, setUploadingCover] = useState(false);
  
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingCover(true);
    
    // Simulate cover upload
    setTimeout(() => {
      toast.success('Cover image updated! (Mock implementation)');
      setUploadingCover(false);
    }, 1500);
  };

  if (loading || !profile) {
    return (
      <div className="pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 transition-colors duration-300">
      <div className="container max-w-6xl px-4 w-full mx-auto">
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column (Main Content - 70%) */}
          <div className="lg:col-span-8 space-y-8">
            <ProfileHero 
              profile={profile} 
              onAvatarUpload={handleAvatarUpload} 
              uploading={uploading} 
              onCoverUpload={handleCoverUpload}
              uploadingCover={uploadingCover}
              onEditClick={() => setShowSettings(!showSettings)}
            />

            {showSettings ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <SettingsForm profile={profile} onSave={handleSave} saving={saving} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <QuickStats stats={stats} />
                <CommunityReport />
                <Achievements />
                <TasteProfile />
              </motion.div>
            )}
          </div>

          {/* Right Column (Sidebar - 30%) */}
          <div className="lg:col-span-4 space-y-8 lg:-mt-2">
            <FoodImpact />
            <MonthlyGoals />
            <PerformanceInsights />
            <ActivityTimeline />
          </div>

        </div>
      </div>
    </div>
  );
}

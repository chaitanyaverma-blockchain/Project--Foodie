'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera, MapPin, Calendar, Edit3, Share2, Award, ChevronRight } from 'lucide-react';
import type { Profile } from '@/types';

interface ProfileHeroProps {
  profile: Profile;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  onCoverUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingCover?: boolean;
  onEditClick: () => void;
}

export default function ProfileHero({ 
  profile, 
  onAvatarUpload, 
  uploading, 
  onCoverUpload, 
  uploadingCover, 
  onEditClick 
}: ProfileHeroProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const trophies = profile.trophies || 0;
  
  const league = profile.league || (trophies > 1000 ? 'Crystal Chef III' : 'Home Cook');
  const level = Math.floor(trophies / 200) + 1;
  const xpProgress = (trophies % 200) / 200 * 100;
  const recipesNeeded = 5;

  return (
    <div className="bg-white dark:bg-[#4E342E] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden border border-[#F5E6D3] dark:border-[#5D4037]">
      {/* Banner / Cover Photo */}
      <div className="h-[320px] sm:h-[340px] relative overflow-hidden bg-gradient-to-r from-[#FF8A00] to-[#E65100]">
        
        {/* Cover Image or Default Gradient */}
        {profile.cover_url ? (
          <Image src={profile.cover_url} alt="Cover" fill className="object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/food.png')]" />
            {/* Floating Icons Background for default state */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {['🍔', '🍕', '🥗', '🍣', '🍰'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-5xl drop-shadow-xl filter"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: [0, -30, 0], opacity: 0.6 }}
                  transition={{ repeat: Infinity, duration: 5 + i, ease: 'easeInOut' }}
                  style={{ left: `${15 + i * 18}%`, top: `${15 + (i % 2) * 20}%` }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </>
        )}

        {/* Dark Gradient Overlay for Readability (40-50%) */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Banner Camera Button (Top Right) */}
        <label className="absolute top-6 right-6 z-20 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full shadow-lg cursor-pointer transition-colors border border-white/20">
          {uploadingCover ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={onCoverUpload} />
        </label>
      </div>

      {/* Profile Content */}
      <div className="px-6 sm:px-10 pb-10 relative">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 relative">
          
          {/* Avatar Area (Overlaps Banner by ~40%) */}
          <div className="-mt-[80px] sm:-mt-[90px] relative shrink-0 flex flex-col items-center">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="relative w-[170px] h-[170px] sm:w-[190px] sm:h-[190px] rounded-full overflow-hidden border-[5px] border-white shadow-[0_4px_20px_rgba(0,0,0,0.1),0_0_20px_rgba(255,138,0,0.4)] bg-white dark:bg-[#3E2723] z-10"
            >
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FF8A00] to-[#E65100] flex items-center justify-center">
                  <span className="font-serif font-bold text-7xl text-white drop-shadow-md">
                    {profile.full_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
              )}
            </motion.div>
            {/* Avatar Camera Button (Bottom Right of Avatar) */}
            <label className="absolute bottom-4 right-4 z-20 p-3 bg-white dark:bg-[#5D4037] rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border border-gray-100 dark:border-[#6D4C41]">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-[#FF6B00]" />
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={onAvatarUpload} />
            </label>
          </div>

          {/* User Info (Beside Avatar) */}
          <div className="pt-4 flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#3E2723] dark:text-[#FFF8E1] tracking-tight">
                  {profile.full_name || 'Food Enthusiast'}
                </h1>
                <motion.span 
                  whileHover={{ textShadow: "0px 0px 8px rgba(255,107,0,0.5)" }}
                  className="px-3 py-1 bg-gradient-to-r from-[#FF8A00] to-[#E65100] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1"
                >
                  {league} <Award className="w-3 h-3" />
                </motion.span>
              </div>
              
              <p className="text-[#FF6B00] font-semibold text-lg">@{profile.username || profile.id.split('-')[0]}</p>
              
              <div className="flex flex-wrap items-center gap-5 text-[15px] text-[#8D6E63] dark:text-[#A1887F] font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {profile.location || 'Earth'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Joined {joinDate}</span>
              </div>
              
              {profile.bio && (
                <p className="text-[#5D4037] dark:text-[#BCAAA4] max-w-xl text-base leading-relaxed mt-2">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Action Buttons (Right Aligned, Same Height) */}
            <div className="flex gap-3 sm:mt-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={onEditClick} 
                className="px-6 py-2 h-[42px] bg-[#FFF3E0] dark:bg-[#5D4037] text-[#FF6B00] dark:text-[#FFB74D] rounded-full font-bold shadow-sm hover:bg-[#FFE0B2] dark:hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 text-sm border border-[#FFE0B2] dark:border-[#6D4C41]"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 h-[42px] bg-white dark:bg-[#3E2723] text-[#3E2723] dark:text-[#FFF8E1] rounded-full font-medium shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-[#5D4037] flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>
            
          </div>
        </div>

        {/* Premium Trophy Card (Clash of Clans Style) */}
        <div className="mt-10 bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E0] dark:from-[#3E2723] dark:to-[#2D1B17] rounded-2xl p-6 border border-[#FFE0B2] dark:border-[#5D4037] shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF8A00]/10 to-transparent rounded-bl-full" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF8A00] to-[#E65100] flex items-center justify-center shadow-lg shadow-[#FF8A00]/30 border-2 border-white/20">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#FF6B00] uppercase tracking-wider mb-1">Current League</p>
                <h3 className="text-2xl font-black text-[#3E2723] dark:text-[#FFF8E1]">{league}</h3>
              </div>
            </div>

            <div className="flex-1 w-full md:max-w-md">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xl font-black text-[#3E2723] dark:text-[#FFF8E1] flex items-center gap-1">
                    <span className="text-[#FF8A00]">⭐</span> {trophies.toLocaleString()}
                  </span>
                  <p className="text-xs font-semibold text-[#8D6E63] dark:text-[#BCAAA4] mt-0.5 uppercase tracking-wide">Trophies</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-[#3E2723] dark:bg-black/40 text-[#FFB74D] text-xs font-black rounded-lg shadow-inner">
                    LVL {level}
                  </span>
                  <p className="text-[11px] font-bold text-[#8D6E63] dark:text-[#A1887F] mt-1.5 uppercase">Next: {level + 1}</p>
                </div>
              </div>
              
              <div className="h-4 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${xpProgress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#FFB74D] via-[#FF8A00] to-[#FF5500] rounded-full shadow-[0_0_10px_rgba(255,138,0,0.8)]"
                />
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs font-medium text-[#8D6E63] dark:text-[#A1887F]">
                  <span className="font-bold text-[#FF6B00]">{200 - (trophies % 200)}</span> more trophies to promote
                </p>
                <p className="text-xs font-medium text-[#8D6E63] dark:text-[#A1887F] flex items-center gap-1">
                  Requires {recipesNeeded} recipes <ChevronRight className="w-3 h-3" />
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

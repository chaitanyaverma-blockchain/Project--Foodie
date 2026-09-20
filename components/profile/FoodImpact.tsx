'use client';

import React from 'react';
import { Globe, Users, Utensils, Heart } from 'lucide-react';

export default function FoodImpact() {
  return (
    <div className="bg-gradient-to-br from-[#3E2723] to-[#2D1B17] rounded-[20px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#5D4037] text-center relative overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')] pointer-events-none" />
      
      {/* Soft orange glow on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FF8A00] opacity-0 blur-[100px] transition-opacity duration-500 group-hover:opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFB74D] mb-3" />
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1">Food Impact</h2>
        <p className="text-sm sm:text-base text-[#BCAAA4]">Your recipes are making kitchens happier.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        
        {/* Card 1 */}
        <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-[16px] border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center min-h-[100px]">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB74D] mb-2 opacity-80" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFB74D] leading-none mb-1">12.8k</p>
          <p className="text-[10px] sm:text-xs font-medium text-[#EFEBE9] uppercase tracking-wider text-center">People Inspired</p>
        </div>

        {/* Card 2 */}
        <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-[16px] border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center min-h-[100px]">
          <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB74D] mb-2 opacity-80" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFB74D] leading-none mb-1">8,430</p>
          <p className="text-[10px] sm:text-xs font-medium text-[#EFEBE9] uppercase tracking-wider text-center">Meals Cooked</p>
        </div>

        {/* Card 3 */}
        <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-[16px] border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center min-h-[100px]">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB74D] mb-2 opacity-80" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFB74D] leading-none mb-1">3.2M</p>
          <p className="text-[10px] sm:text-xs font-medium text-[#EFEBE9] uppercase tracking-wider text-center">Community Reach</p>
        </div>

      </div>
    </div>
  );
}

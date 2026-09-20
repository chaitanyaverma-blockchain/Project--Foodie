'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Award } from 'lucide-react';

export default function CommunityReport() {
  const metrics = [
    { label: 'Total Likes', value: '1,245', growth: '+12%', isPositive: true },
    { label: 'Total Saves', value: '430', growth: '+5%', isPositive: true },
    { label: 'Followers Gained', value: '84', growth: '+22%', isPositive: true },
    { label: 'Profile Visits', value: '2,109', growth: '-3%', isPositive: false },
    { label: 'Engagement Rate', value: '8.4%', growth: '+1.2%', isPositive: true },
    { label: 'Avg Rating', value: '4.8', growth: '+0.1', isPositive: true },
  ];

  return (
    <div className="bg-white dark:bg-[#4E342E] rounded-2xl p-6 md:p-8 shadow-sm border border-[#F5E6D3] dark:border-[#5D4037]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#3E2723] dark:text-[#FFF8E1]">Community Analytics</h2>
          <p className="text-[#8D6E63] dark:text-[#BCAAA4] text-sm">Your performance this month.</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-[#FF6B00] bg-[#FFF3E0] dark:bg-[#5D4037] rounded-full">
          This Month
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[#8D6E63] dark:text-[#BCAAA4] text-sm">{m.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-[#3E2723] dark:text-[#FFF8E1]">{m.value}</span>
              <span className={`text-xs font-bold mb-1 flex items-center ${m.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {m.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {m.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Chart Mockup */}
      <div className="h-40 w-full bg-[#FAFAFA] dark:bg-[#3E2723] rounded-xl flex items-end p-4 gap-2 border border-[#F5E6D3] dark:border-[#5D4037]">
        {[40, 65, 45, 80, 55, 95, 75, 100, 85, 110, 90, 120].map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${(height/120)*100}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="flex-1 bg-gradient-to-t from-[#FF8A00] to-[#FFB74D] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#FFF3E0] dark:bg-[#3E2723] rounded-xl flex items-start gap-4">
          <div className="p-2 bg-white dark:bg-[#4E342E] rounded-lg text-[#FF6B00]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#3E2723] dark:text-[#FFF8E1]">Most Popular Recipe</h4>
            <p className="text-sm text-[#8D6E63] dark:text-[#BCAAA4]">Spicy Chicken Tikka Masala</p>
          </div>
        </div>
        <div className="p-4 bg-[#FFF3E0] dark:bg-[#3E2723] rounded-xl flex items-start gap-4">
          <div className="p-2 bg-white dark:bg-[#4E342E] rounded-lg text-[#FF6B00]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#3E2723] dark:text-[#FFF8E1]">Highest Engagement</h4>
            <p className="text-sm text-[#8D6E63] dark:text-[#BCAAA4]">Classic Margherita Pizza</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Sparkles } from 'lucide-react';

export default function TasteProfile() {
  const cuisines = [
    { name: 'Indian', percentage: 45, color: 'bg-orange-500' },
    { name: 'Italian', percentage: 25, color: 'bg-red-500' },
    { name: 'Asian', percentage: 15, color: 'bg-amber-400' },
    { name: 'Desserts', percentage: 10, color: 'bg-pink-400' },
    { name: 'Healthy', percentage: 5, color: 'bg-green-500' },
  ];

  return (
    <div className="bg-white dark:bg-[#4E342E] rounded-2xl p-6 md:p-8 shadow-sm border border-[#F5E6D3] dark:border-[#5D4037]">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-6 h-6 text-[#FF6B00]" />
        <h2 className="text-2xl font-serif font-bold text-[#3E2723] dark:text-[#FFF8E1]">Taste Profile</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-[#3E2723] dark:text-[#FFF8E1] mb-4">Favorite Cuisines</h3>
          <div className="space-y-4">
            {cuisines.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#8D6E63] dark:text-[#BCAAA4]">{c.name}</span>
                  <span className="font-bold text-[#3E2723] dark:text-[#FFF8E1]">{c.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-[#3E2723] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${c.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FFF3E0] dark:bg-[#3E2723] rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white dark:bg-[#4E342E] rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Sparkles className="w-8 h-8 text-[#FF6B00]" />
          </div>
          <h3 className="font-bold text-[#8D6E63] dark:text-[#BCAAA4] text-sm uppercase tracking-wider mb-1">AI Food Personality</h3>
          <p className="text-2xl font-serif font-bold text-[#3E2723] dark:text-[#FFF8E1]">Spice Lover 🌶️</p>
          <p className="text-sm text-[#8D6E63] dark:text-[#BCAAA4] mt-2">
            You have a strong preference for rich, spicy Indian curries and bold flavors.
          </p>
          
          <div className="w-full mt-6 space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg">
              <span className="text-[#8D6E63] dark:text-[#BCAAA4]">Favorite Dish</span>
              <span className="font-bold text-[#3E2723] dark:text-[#FFF8E1]">Butter Chicken</span>
            </div>
            <div className="flex justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg">
              <span className="text-[#8D6E63] dark:text-[#BCAAA4]">Most Ordered</span>
              <span className="font-bold text-[#3E2723] dark:text-[#FFF8E1]">Indian</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Users, UserPlus, Bookmark } from 'lucide-react';

interface QuickStatsProps {
  stats: {
    recipes: number;
    followers: number;
    following: number;
    saves: number;
    [key: string]: any; // Allow other properties but we don't strictly require them
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const statItems = [
    { label: 'Recipes Shared', value: stats.recipes || 0, icon: <Utensils className="w-5 h-5" />, color: 'from-[#FF8A00] to-[#E65100]' },
    { label: 'Followers', value: stats.followers || 0, icon: <Users className="w-5 h-5" />, color: 'from-[#10B981] to-[#059669]' },
    { label: 'Following', value: stats.following || 0, icon: <UserPlus className="w-5 h-5" />, color: 'from-[#14B8A6] to-[#0D9488]' },
    { label: 'Saved Recipes', value: stats.saves || 0, icon: <Bookmark className="w-5 h-5" />, color: 'from-[#6366F1] to-[#4338CA]' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
      >
        {statItems.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={item}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white dark:bg-[#4E342E] p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-[#F5E6D3] dark:border-[#5D4037] flex flex-col justify-center items-center text-center cursor-default group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:rotate-6 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-black text-[#3E2723] dark:text-[#FFF8E1] tracking-tight">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-[#8D6E63] dark:text-[#BCAAA4] text-xs font-semibold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

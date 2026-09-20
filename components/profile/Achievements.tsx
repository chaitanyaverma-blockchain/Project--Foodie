'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, ChefHat, Pizza, Cake, Crown, Star, Flame } from 'lucide-react';

export default function Achievements() {
  const achievements = [
    { id: 'first_recipe', title: 'First Recipe', icon: <ChefHat />, description: 'Uploaded your first recipe', unlocked: true },
    { id: '100_likes', title: '100 Likes', icon: <Heart />, description: 'Received 100 total likes', unlocked: true },
    { id: 'top_creator', title: 'Top Creator', icon: <Crown />, description: 'Reached top 5% of creators', unlocked: false },
    { id: 'community_fav', title: 'Community Favorite', icon: <Star />, description: 'Recipe saved 50 times', unlocked: false },
    { id: 'pizza_master', title: 'Pizza Master', icon: <Pizza />, description: 'Shared 5 pizza recipes', unlocked: true },
    { id: 'dessert_expert', title: 'Dessert Expert', icon: <Cake />, description: 'Shared 10 dessert recipes', unlocked: false },
    { id: 'master_chef', title: 'Master Chef', icon: <Award />, description: 'Reached Master Chef league', unlocked: false },
    { id: 'trending', title: 'Trending', icon: <Flame />, description: 'Recipe trending this week', unlocked: true },
  ];

  // Using a local Heart component since we didn't import it above for 100_likes
  function Heart() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>; }

  return (
    <div className="bg-white dark:bg-[#4E342E] rounded-[24px] shadow-sm border border-[#F5E6D3] dark:border-[#5D4037] overflow-hidden p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#3E2723] dark:text-[#FFF8E1]">Achievements</h2>
          <p className="text-[#8D6E63] dark:text-[#BCAAA4] text-sm">Badges you've earned on your journey.</p>
        </div>
        <div className="text-[#FF6B00] font-bold text-sm bg-[#FFF3E0] dark:bg-[#5D4037] px-4 py-2 rounded-full">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={achievement.unlocked ? { scale: 1.05, y: -5 } : {}}
            className={`
              relative p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300
              ${achievement.unlocked 
                ? 'bg-gradient-to-br from-white to-[#FFF8F0] dark:from-[#4E342E] dark:to-[#3E2723] border-[#FFB74D] shadow-[0_0_15px_rgba(255,171,64,0.15)]' 
                : 'bg-gray-50 dark:bg-[#2D1B17] border-gray-200 dark:border-[#3E2723] opacity-60 grayscale'}
            `}
          >
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner
              ${achievement.unlocked ? 'bg-gradient-to-br from-[#FF8A00] to-[#E65100] text-white shadow-[#FF8A00]/40' : 'bg-gray-200 text-gray-500'}
            `}>
              {React.cloneElement(achievement.icon as React.ReactElement, { className: 'w-8 h-8' })}
            </div>
            <h3 className={`font-bold ${achievement.unlocked ? 'text-[#3E2723] dark:text-[#FFF8E1]' : 'text-gray-500 dark:text-gray-400'}`}>
              {achievement.title}
            </h3>
            <p className="text-xs mt-1 text-[#8D6E63] dark:text-gray-500 line-clamp-2">
              {achievement.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

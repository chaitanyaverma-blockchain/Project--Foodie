'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function MonthlyGoals() {
  const goals = [
    { title: 'Upload 5 recipes', current: 3, target: 5, color: 'from-orange-400 to-orange-600' },
    { title: 'Get 500 likes', current: 420, target: 500, color: 'from-red-400 to-red-600' },
    { title: 'Reach Gold League', current: 800, target: 1000, color: 'from-yellow-400 to-yellow-600' },
  ];

  return (
    <div className="bg-white dark:bg-[#4E342E] rounded-2xl p-6 md:p-8 shadow-sm border border-[#F5E6D3] dark:border-[#5D4037]">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-[#FF6B00]" />
        <h2 className="text-2xl font-serif font-bold text-[#3E2723] dark:text-[#FFF8E1]">Monthly Goals</h2>
      </div>

      <div className="space-y-6">
        {goals.map((goal, i) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[#3E2723] dark:text-[#FFF8E1]">{goal.title}</span>
                <span className="font-bold text-[#8D6E63] dark:text-[#BCAAA4]">
                  {goal.current} / {goal.target}
                </span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-[#3E2723] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className={`h-full bg-gradient-to-r ${goal.color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

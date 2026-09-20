'use client';

import React from 'react';
import { Heart, Bookmark, Star, UserPlus, ShoppingBag, MessageCircle, Flame } from 'lucide-react';

export default function ActivityTimeline() {
  const activities = [
    { id: 1, type: 'like', text: 'Rahul liked your Butter Chicken recipe', time: '2 hours ago', icon: <Heart className="w-4 h-4 text-red-500" /> },
    { id: 2, type: 'save', text: 'Priya saved your Pasta recipe', time: '5 hours ago', icon: <Bookmark className="w-4 h-4 text-indigo-500" /> },
    { id: 3, type: 'review', text: 'You received a 5-star review', time: '1 day ago', icon: <Star className="w-4 h-4 text-yellow-500" /> },
    { id: 4, type: 'trending', text: 'Your recipe became Trending', time: '2 days ago', icon: <Flame className="w-4 h-4 text-orange-500" /> },
    { id: 5, type: 'follow', text: 'You gained 15 followers', time: '3 days ago', icon: <UserPlus className="w-4 h-4 text-emerald-500" /> },
    { id: 6, type: 'order', text: 'You ordered Pizza Margherita', time: '1 week ago', icon: <ShoppingBag className="w-4 h-4 text-blue-500" /> },
    { id: 7, type: 'comment', text: 'Aman commented on your recipe', time: '1 week ago', icon: <MessageCircle className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <div className="bg-white dark:bg-[#4E342E] rounded-2xl p-6 md:p-8 shadow-sm border border-[#F5E6D3] dark:border-[#5D4037]">
      <h2 className="text-2xl font-serif font-bold text-[#3E2723] dark:text-[#FFF8E1] mb-6">Activity Timeline</h2>
      
      <div className="relative border-l-2 border-gray-100 dark:border-[#5D4037] ml-3 md:ml-4 space-y-8 pb-4">
        {activities.map((activity, i) => (
          <div key={activity.id} className="relative pl-6 md:pl-8 group">
            <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white dark:bg-[#3E2723] border border-gray-200 dark:border-[#5D4037] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              {activity.icon}
            </div>
            <div>
              <p className="text-[#3E2723] dark:text-[#FFF8E1] font-medium">{activity.text}</p>
              <p className="text-[#8D6E63] dark:text-[#BCAAA4] text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-3 text-sm font-bold text-[#FF6B00] hover:bg-[#FFF3E0] dark:hover:bg-[#5D4037] rounded-xl transition-colors">
        View All Activity
      </button>
    </div>
  );
}

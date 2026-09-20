'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function PerformanceInsights() {
  const insights = [
    "Your Italian recipes receive 42% more engagement than other cuisines.",
    "Your audience is most active between 7 PM and 10 PM. Try posting then!",
    "Your recipe save rate increased by 18% this week. Great job!",
    "You gained 120 followers this month, putting you in the top 10% of growing creators."
  ];

  return (
    <div className="bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] dark:from-[#4E342E] dark:to-[#3E2723] rounded-2xl p-6 md:p-8 shadow-sm border border-[#F5E6D3] dark:border-[#5D4037]">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-[#FF6B00]" />
        <h2 className="text-2xl font-serif font-bold text-[#3E2723] dark:text-[#FFF8E1]">AI Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white/60 dark:bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/50 dark:border-white/5">
            <p className="text-[#5D4037] dark:text-[#D7CCC8] font-medium leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

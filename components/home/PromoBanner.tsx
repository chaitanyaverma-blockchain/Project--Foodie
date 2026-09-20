'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tag, Zap } from 'lucide-react';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import type { Coupon } from '@/types';

interface PromoBannerProps {
  coupons: Coupon[];
}

export function PromoBanner({ coupons }: PromoBannerProps) {
  // Get a target date 24h from page load
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 18, 0, 0, 0);
    return d;
  }, []);

  if (coupons.length === 0) return null;

  const featuredCoupon = coupons[0];

  return (
    <section className="py-6 bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF6B00] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                Limited Time Offer
              </p>
              <p className="text-white font-bold text-lg leading-tight">
                {featuredCoupon.description ?? `Get ${featuredCoupon.value}${featuredCoupon.type === 'percentage' ? '%' : '₹'} OFF!`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Coupon Code */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-dashed border-white/60 rounded-xl px-4 py-2">
              <Tag className="w-4 h-4 text-white" />
              <span className="font-mono font-black text-white text-lg tracking-widest">
                {featuredCoupon.code}
              </span>
            </div>

            {/* Countdown */}
            <div className="text-white text-sm">
              <p className="text-white/70 text-xs mb-0.5 font-medium">Expires in</p>
              <CountdownTimer targetDate={targetDate} className="text-white font-bold text-base" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PromoBannerSkeleton() {
  return (
    <div className="h-20 shimmer" />
  );
}

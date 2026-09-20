'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import type { FoodItem } from '@/types';
import { FoodItemCard } from '@/components/menu/FoodItemCard';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';

interface TrendingDishesProps {
  items: FoodItem[];
  loading?: boolean;
}

export function TrendingDishes({ items, loading = false }: TrendingDishesProps) {
  return (
    <section className="py-14 bg-bg-secondary">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-brand-orange" />
              <p className="text-brand-orange text-sm font-bold uppercase tracking-widest">Most Popular</p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
              Trending This Week
            </h2>
            <p className="text-text-secondary mt-2 text-sm">
              Based on ratings and orders from our community
            </p>
          </div>
          <Link
            href="/menu"
            className="hidden md:flex items-center gap-2 text-brand-orange font-semibold text-sm hover:gap-3 transition-all group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
            : items.slice(0, 4).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <FoodItemCard item={item} />
                </motion.div>
              ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-brand-orange font-semibold border-2 border-brand-orange px-6 py-3 rounded-xl hover:bg-brand-orange hover:text-white transition-all"
          >
            View All Dishes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

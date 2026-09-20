'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { FoodItem } from '@/types';
import { FoodItemCard } from '@/components/menu/FoodItemCard';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';

interface BestSellersProps {
  items: FoodItem[];
  loading?: boolean;
}

export function BestSellers({ items, loading = false }: BestSellersProps) {
  // Sort by order_count for true best sellers
  const bestSellers = [...items]
    .sort((a, b) => b.order_count - a.order_count)
    .slice(0, 4);

  if (!loading && bestSellers.length === 0) return null;

  return (
    <section className="py-14 bg-bg-secondary">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-500" />
              <p className="text-amber-500 text-sm font-bold uppercase tracking-widest">Crowd Favourites</p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
              Best Sellers
            </h2>
            <p className="text-text-secondary mt-2 text-sm">
              The dishes everyone is talking about
            </p>
          </div>
          <Link
            href="/menu?sort=popular"
            className="hidden md:flex items-center gap-2 text-amber-600 font-semibold text-sm hover:gap-3 transition-all group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
            : bestSellers.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative"
                >
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-bg-secondary shadow-lg z-20">
                    #{i + 1}
                  </div>
                  <FoodItemCard item={item} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { FoodItem } from '@/types';
import { FoodItemCard } from '@/components/menu/FoodItemCard';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';

interface RecommendedForYouProps {
  items: FoodItem[];
  loading?: boolean;
}

export function RecommendedForYou({ items, loading = false }: RecommendedForYouProps) {
  // Use a mix of logic (e.g. random or pseudo-random based on id) to simulate recommendations
  const recommended = [...items]
    .sort((a, b) => (a.id.charCodeAt(0) - b.id.charCodeAt(0)))
    .slice(0, 4);

  if (!loading && recommended.length === 0) return null;

  return (
    <section className="py-14 bg-bg-secondary">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <p className="text-blue-500 text-sm font-bold uppercase tracking-widest">Just For You</p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
              AI Recommended
            </h2>
            <p className="text-text-secondary mt-2 text-sm">
              Personalised picks based on your taste
            </p>
          </div>
          <Link
            href="/menu"
            className="hidden md:flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all group"
          >
            See More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
            : recommended.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <FoodItemCard item={item} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}

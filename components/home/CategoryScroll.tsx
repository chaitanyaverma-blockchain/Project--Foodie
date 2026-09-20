'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryScrollProps {
  categories: Category[];
}

export function CategoryScroll({ categories }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -240 : 240, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-14">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-brand-orange text-sm font-bold uppercase tracking-widest mb-1">Browse by</p>
            <h2 className="font-serif text-3xl font-bold text-text-primary">Cuisine Categories</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                href={`/menu?category=${cat.slug}`}
                id={`category-${cat.slug}`}
                className="group flex flex-col items-center gap-3 min-w-[100px] cursor-pointer"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-bg-card shadow-card group-hover:shadow-card-hover group-hover:border-brand-orange transition-all duration-300">
                  <Image
                    src={cat.image_url ?? `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200`}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="80px"
                  />
                </div>
                <span className="text-xs font-semibold text-text-primary text-center group-hover:text-brand-orange transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Static fallback for skeleton
export function CategoryScrollSkeleton() {
  return (
    <section className="py-14">
      <div className="container">
        <div className="h-8 w-48 bg-gray-100 rounded-xl mb-8 shimmer" />
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 min-w-[100px]">
              <div className="w-20 h-20 rounded-full shimmer" />
              <div className="h-3 w-16 shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { FoodItem } from '@/types';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface TodaysDealsProps {
  items: FoodItem[];
}

export function TodaysDeals({ items }: TodaysDealsProps) {
  const { addItem } = useCart();

  // Only show items with discounts
  const deals = items.filter((item) => item.sale_price && item.sale_price < item.price).slice(0, 4);

  if (deals.length === 0) return null;

  const handleQuickAdd = (item: FoodItem) => {
    const price = getEffectivePrice(item.price, item.sale_price);
    addItem({
      food_item_id: item.id,
      name: item.name,
      image_url: item.image_url,
      price,
      is_veg: item.is_veg,
      is_egg: item.is_egg,
      selected_options: [],
    });
    toast.success(`${item.name} added!`, { icon: '🛒' });
  };

  return (
    <section className="py-14 bg-bg-primary">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-[#FF6B00]" />
              <p className="text-[#FF6B00] text-sm font-bold uppercase tracking-widest">Limited Time</p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
              Today&apos;s Deals
            </h2>
            <p className="text-text-secondary mt-2 text-sm">Grab them before they&apos;re gone!</p>
          </div>
          <Link
            href="/menu"
            className="hidden md:flex items-center gap-2 text-[#FF6B00] font-semibold text-sm hover:gap-3 transition-all group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {deals.map((item, i) => {
            const effectivePrice = getEffectivePrice(item.price, item.sale_price);
            const discount = getDiscountPercent(item.price, item.sale_price);
            const savings = item.price - effectivePrice;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group relative bg-bg-card rounded-[20px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border-light dark:border-[#2A2A2A]"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 text-5xl">
                      🍽️
                    </div>
                  )}

                  {/* Discount overlay */}
                  {discount && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-full shadow-lg animate-badge-pulse">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary text-sm line-clamp-1 mb-1">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-text-primary">{item.rating.toFixed(1)}</span>
                    <span className="text-border">•</span>
                    <Clock className="w-3 h-3" />
                    <span>{15 + ((item.id.charCodeAt(0) * 7) % 30)} mins</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-text-primary text-base">{formatPrice(effectivePrice)}</span>
                        <span className="text-xs text-text-muted line-through">{formatPrice(item.price)}</span>
                      </div>
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                        Save {formatPrice(savings)}
                      </p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuickAdd(item)}
                      className="btn-ripple px-3 py-1.5 bg-[#FF6B00] text-white rounded-lg text-xs font-bold hover:bg-[#E56000] transition-colors shadow-sm"
                    >
                      + Add
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChefHat, Star, Clock, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { FoodItem } from '@/types';
import { formatPrice, getEffectivePrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { FoodItemCard } from '@/components/menu/FoodItemCard';

interface ChefSpecialProps {
  items: FoodItem[];
}

export function ChefSpecial({ items }: ChefSpecialProps) {
  const { addItem } = useCart();
  
  // Pick a highly rated item as the main feature
  const chefSpecials = items.filter(i => i.rating >= 4.5).sort(() => 0.5 - Math.random());
  if (chefSpecials.length < 3) return null;

  const featured = chefSpecials[0];
  const sideItems = chefSpecials.slice(1, 3);

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
    toast.success(`${item.name} added!`, { icon: '🧑‍🍳' });
  };

  return (
    <section className="py-14 bg-bg-primary overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-5 h-5 text-purple-500" />
              <p className="text-purple-500 text-sm font-bold uppercase tracking-widest">Masterpieces</p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
              Chef&apos;s Specials
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden md:flex items-center gap-2 text-purple-600 font-semibold text-sm hover:gap-3 transition-all group"
          >
            Explore Menu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Featured Item */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 relative bg-bg-card rounded-[24px] overflow-hidden shadow-card border border-border-light group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
            <div className="absolute inset-0">
              {featured.image_url ? (
                <Image
                  src={featured.image_url}
                  alt={featured.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full bg-purple-900/20" />
              )}
            </div>

            <div className="relative z-20 h-full p-8 md:p-12 flex flex-col justify-end min-h-[400px]">
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 rounded-full text-purple-100 text-xs font-bold uppercase tracking-wide">
                <ChefHat className="w-3.5 h-3.5" /> Signature Dish
              </div>
              <h3 className="font-serif text-3xl md:text-5xl font-bold text-white mb-3 max-w-lg leading-tight">
                {featured.name}
              </h3>
              <p className="text-gray-300 mb-6 max-w-md line-clamp-2">
                {featured.description || "Experience culinary perfection with our head chef's personal recommendation for today."}
              </p>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-medium mb-1">Price</span>
                  <span className="text-white text-2xl font-bold">
                    {formatPrice(getEffectivePrice(featured.price, featured.sale_price))}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAdd(featured)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add to Order
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Side Items */}
          <div className="flex flex-col gap-6">
            {sideItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="h-full"
              >
                <FoodItemCard item={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

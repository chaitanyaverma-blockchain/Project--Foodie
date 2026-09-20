'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { FoodItem } from '@/types';
import { FoodItemCard } from '@/components/menu/FoodItemCard';
import { useFavourites } from '@/context/FavouritesContext';

interface YourFavouritesProps {
  allItems: FoodItem[]; // Pass all items from home page data to resolve full item details
}

export function YourFavourites({ allItems }: YourFavouritesProps) {
  const { favourites } = useFavourites();

  if (favourites.length === 0) return null;

  // Resolve the full item objects based on the favorited IDs
  const favouriteItems = allItems.filter(item => favourites.includes(item.id));

  // If none of the favorite IDs exist in the fetched items (e.g. if we only fetched top 20 items),
  // we would ideally need a separate fetch. But for now, we render the ones we have.
  if (favouriteItems.length === 0) return null;

  return (
    <section className="py-14 bg-bg-primary overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <p className="text-red-500 text-sm font-bold uppercase tracking-widest">Your Picks</p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
              Your Favourites
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden md:flex items-center gap-2 text-red-600 font-semibold text-sm hover:gap-3 transition-all group"
          >
            Explore More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 drawer-scroll snap-x">
          {favouriteItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start h-full"
            >
              <FoodItemCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

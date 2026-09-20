'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HeartOff, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useFavourites } from '@/context/FavouritesContext';
import { FoodItemCard } from '@/components/menu/FoodItemCard';
import { CustomizationModal } from '@/components/menu/CustomizationModal';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';
import type { FoodItem, Category } from '@/types';

export default function FavoritesPage() {
  const { favorites } = useFavourites();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const [customizeItem, setCustomizeItem] = useState<FoodItem | null>(null);

  const supabase = createClient();

  // Fetch favorite items
  useEffect(() => {
    async function fetchFavorites() {
      if (!favorites || favorites.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('food_items')
        .select('*, categories(*), food_options(*, food_option_values(*))')
        .in('id', favorites);
      
      if (data) {
        setItems(data as FoodItem[]);
      }
      setLoading(false);
    }
    fetchFavorites();
  }, [favorites, supabase]);

  // Fetch recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      const { data } = await supabase
        .from('food_items')
        .select('*, categories(*), food_options(*, food_option_values(*))')
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .limit(4);
      
      if (data) {
        setRecommendations(data as FoodItem[]);
      }
    }
    fetchRecommendations();
  }, [supabase]);

  // Client-side filtering & sorting
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(s) || 
        item.description?.toLowerCase().includes(s)
      );
    }

    // Filters
    if (filter === 'veg') result = result.filter(i => i.is_veg && !i.dietary_tags?.includes('drink'));
    if (filter === 'non-veg') result = result.filter(i => !i.is_veg && !i.is_egg && !i.dietary_tags?.includes('drink'));
    if (filter === 'egg') result = result.filter(i => i.is_egg);
    if (filter === 'drinks') result = result.filter(i => i.dietary_tags?.includes('drink'));
    if (filter === 'rating') result = result.filter(i => i.rating >= 4.5);

    // Sorting
    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'alpha': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      // newest just uses original fetch order which is fine, or we could track added time
      default: break; 
    }

    // Ensure we only show items that are still in favorites context
    // This handles the instant UI removal when heart is clicked
    result = result.filter(item => favorites.includes(item.id));

    return result;
  }, [items, search, filter, sort, favorites]);

  const hasFavorites = favorites && favorites.length > 0;

  return (
    <>
      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-[#2A1515] dark:to-[#1A1A1A] pt-28 pb-12">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-red-500 font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
              My Collections <ChevronRight className="w-4 h-4" />
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white mb-4">
              My Favorites ❤️
            </h1>
            
            {hasFavorites && (
              <div className="flex gap-3 max-w-lg mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search favorites..."
                    className="w-full pl-11 pr-5 py-3 bg-white/60 dark:bg-black/30 border border-white/40 dark:border-white/10 rounded-xl text-text-primary dark:text-white placeholder-gray-500 dark:placeholder:text-[#9CA3AF] focus:outline-none focus:border-red-500 text-sm backdrop-blur-md shadow-sm transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container py-10 min-h-[50vh]">
        {!loading && !hasFavorites ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="w-32 h-32 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6"
            >
              <HeartOff className="w-12 h-12 text-red-300" />
            </motion.div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No favorite dishes yet.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
              Save your favorite dishes from the menu and order them anytime with just one click.
            </p>
            <Link 
              href="/menu"
              className="px-8 py-3 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#E56000] transition-colors shadow-orange hover:shadow-glow-orange"
            >
              Browse Foods
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters Toolbar */}
            {hasFavorites && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2A2A2A]">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'veg', label: 'Veg' },
                    { id: 'non-veg', label: 'Non-Veg' },
                    { id: 'egg', label: 'Egg' },
                    { id: 'drinks', label: 'Drinks' },
                    { id: 'rating', label: 'Top Rated (4.5+)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        filter === f.id
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-900/30'
                          : 'bg-gray-50 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 dark:bg-[#2A2A2A] border-none rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                  >
                    <option value="newest">Newest Added</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="alpha">Alphabetical</option>
                  </select>
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FoodItemCard
                        item={item}
                        onCustomize={setCustomizeItem}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {!loading && filteredItems.length === 0 && hasFavorites && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No favorites match your current filters.</p>
                  <button onClick={() => { setFilter('all'); setSearch(''); }} className="text-red-500 font-semibold mt-2 underline">
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="bg-gray-50 dark:bg-black/20 py-16 mt-8 border-t border-gray-100 dark:border-[#2A2A2A]">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold mb-8 text-text-primary">
            You may also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {recommendations.map(item => (
              <FoodItemCard
                key={item.id}
                item={item}
                onCustomize={setCustomizeItem}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {customizeItem && (
        <CustomizationModal
          item={customizeItem}
          onClose={() => setCustomizeItem(null)}
        />
      )}
    </>
  );
}

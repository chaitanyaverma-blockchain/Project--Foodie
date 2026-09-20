'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { FoodItem, Category, MenuFilters } from '@/types';
import { FoodItemCard } from '@/components/menu/FoodItemCard';
import { FilterSidebar } from '@/components/menu/FilterSidebar';
import { CustomizationModal } from '@/components/menu/CustomizationModal';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';
import { debounce } from '@/lib/utils';
import { useFoodDrawer } from '@/context/FoodDrawerContext';

function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [customizeItem, setCustomizeItem] = useState<FoodItem | null>(null);
  
  const { setAllItems } = useFoodDrawer();

  const [filters, setFilters] = useState<MenuFilters>({
    search: searchParams.get('search') ?? '',
    categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
    veg: false,
    nonVeg: false,
    egg: false,
    priceMin: 0,
    priceMax: 2000,
    rating: 0,
    sort: 'popular',
  });

  const supabase = createClient();

  // Fetch categories once
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch items when filters change
  const fetchItems = useCallback(
    debounce(async (f: MenuFilters) => {
      setLoading(true);
      let query = supabase
        .from('food_items')
        .select('*, categories(*), food_options(*, food_option_values(*))')
        .eq('status', 'active');

      // Search
      if (f.search) {
        query = query.ilike('name', `%${f.search}%`);
      }

      // Category
      if (f.categories && f.categories.length > 0) {
        const { data: cats } = await supabase
          .from('categories')
          .select('id')
          .in('slug', f.categories);
        if (cats && cats.length > 0) {
          query = query.in('category_id', cats.map((c) => c.id));
        }
      }

      // Diet filters
      if (f.veg && !f.nonVeg && !f.egg && !f.drink) {
        query = query.eq('is_veg', true);
      } else if (!f.veg && f.nonVeg && !f.egg && !f.drink) {
        query = query.eq('is_veg', false).eq('is_egg', false);
      } else if (!f.veg && !f.nonVeg && f.egg && !f.drink) {
        query = query.eq('is_egg', true);
      } else if (!f.veg && !f.nonVeg && !f.egg && f.drink) {
        query = query.contains('dietary_tags', ['drink']);
      }

      // Price range
      if (f.priceMin) query = query.gte('price', f.priceMin);
      if (f.priceMax && f.priceMax < 2000) query = query.lte('price', f.priceMax);

      // Rating
      if (f.rating && f.rating > 0) query = query.gte('rating', f.rating);

      // Sort
      switch (f.sort) {
        case 'popular':
          query = query.order('order_count', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data } = await query.limit(40);
      const fetchedItems = (data ?? []) as FoodItem[];
      setItems(fetchedItems);
      setAllItems(fetchedItems); // Sync global drawer items
      setLoading(false);
    }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setAllItems]
  );

  useEffect(() => {
    fetchItems(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Sync URL with search param
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.categories?.length) params.set('category', filters.categories[0]);
    const newUrl = params.toString() ? `?${params.toString()}` : '/menu';
    router.replace(newUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.categories]);

  const updateFilter = (partial: Partial<MenuFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      veg: false,
      nonVeg: false,
      egg: false,
      priceMin: 0,
      priceMax: 2000,
      rating: 0,
      sort: 'popular',
    });
  };

  const hasActiveFilters =
    filters.veg || filters.nonVeg || filters.egg ||
    (filters.priceMax && filters.priceMax < 2000) ||
    (filters.rating && filters.rating > 0) ||
    (filters.categories && filters.categories.length > 0);

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2D1B0E] pt-28 pb-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#FF6B00] font-bold text-sm uppercase tracking-widest mb-2">Full Menu</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              What are you craving?
            </h1>
            {/* Search in header */}
            <div className="flex gap-3 max-w-lg">
              <input
                id="menu-search"
                type="text"
                value={filters.search ?? ''}
                onChange={(e) => updateFilter({ search: e.target.value })}
                placeholder="Search dishes, cuisines..."
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#FF6B00] text-sm backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-10">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                categories={categories}
                onUpdate={updateFilter}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  id="mobile-filter-btn"
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3F3F46] rounded-xl text-sm font-semibold hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-5 h-5 bg-[#FF6B00] text-white rounded-full text-xs flex items-center justify-center font-black">
                      !
                    </span>
                  )}
                </button>

                {/* Item count */}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Searching...' : `${items.length} dishes found`}
                </span>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              {/* Sort */}
              <select
                id="sort-select"
                value={filters.sort}
                onChange={(e) => updateFilter({ sort: e.target.value as MenuFilters['sort'] })}
                className="px-4 py-2.5 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3F3F46] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] cursor-pointer text-text-primary"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <FoodCardSkeleton key={i} />)
                : items.length === 0
                ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4">
                    <div className="text-6xl">🍽️</div>
                    <h3 className="font-serif font-bold text-xl text-text-primary">No dishes found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
                    <button
                      onClick={clearFilters}
                      className="text-[#FF6B00] font-semibold underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )
                : items.map((item) => (
                  <FoodItemCard
                    key={item.id}
                    item={item}
                    onCustomize={setCustomizeItem}
                  />
                ))}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {filterOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-[#1E1E1E] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-[#2A2A2A]">
              <h2 className="font-serif font-bold text-lg">Filters</h2>
              <button onClick={() => setFilterOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar
                filters={filters}
                categories={categories}
                onUpdate={updateFilter}
                onClear={() => { clearFilters(); setFilterOpen(false); }}
              />
            </div>
          </motion.div>
        </div>
      )}

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

export default function MenuPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen pt-28 flex items-center justify-center">Loading...</div>}>
      <MenuPageContent />
    </React.Suspense>
  );
}

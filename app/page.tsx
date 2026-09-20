import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategoryScroll, CategoryScrollSkeleton } from '@/components/home/CategoryScroll';
import { TrendingDishes } from '@/components/home/TrendingDishes';
import { PromoBanner } from '@/components/home/PromoBanner';
import { WhyFoodie } from '@/components/home/WhyFoodie';
import { FreeDeliveryBanner } from '@/components/home/FreeDeliveryBanner';
import { TodaysDeals } from '@/components/home/TodaysDeals';
import { BestSellers } from '@/components/home/BestSellers';
import { ChefSpecial } from '@/components/home/ChefSpecial';
import { RecommendedForYou } from '@/components/home/RecommendedForYou';
import { YourFavourites } from '@/components/home/YourFavourites';
import type { Category, FoodItem, Coupon } from '@/types';

export const revalidate = 60; // ISR

async function getHomeData() {
  const supabase = await createClient();

  const [categoriesRes, trendingRes, couponsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('food_items')
      .select('*, categories(*), food_options(*, food_option_values(*))')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .order('order_count', { ascending: false })
      .limit(100), // Increased limit to feed multiple sections and resolve favourites
    supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .limit(3),
  ]);

  return {
    categories: (categoriesRes.data ?? []) as Category[],
    trending: (trendingRes.data ?? []) as FoodItem[],
    coupons: (couponsRes.data ?? []) as Coupon[],
  };
}

export default async function HomePage() {
  const { categories, trending, coupons } = await getHomeData();

  return (
    <>
      {/* 1. Hero */}
      <HeroCarousel />

      {/* 2. Free Delivery Banner */}
      <FreeDeliveryBanner />

      {/* 3. Categories */}
      <Suspense fallback={<CategoryScrollSkeleton />}>
        <CategoryScroll categories={categories} />
      </Suspense>

      {/* 4. Promo Banner */}
      {coupons.length > 0 && <PromoBanner coupons={coupons} />}

      {/* 4.5 Your Favourites (Only shows if user has favourites) */}
      <YourFavourites allItems={trending} />

      {/* 5. Today's Deals (uses items with sale_price) */}
      <TodaysDeals items={trending} />

      {/* 6. Best Sellers (uses order_count) */}
      <BestSellers items={trending} />

      {/* 7. Chef's Special (uses high rating) */}
      <ChefSpecial items={trending} />

      {/* 8. Trending (original) */}
      <TrendingDishes items={trending.slice(0, 8)} />

      {/* 9. AI Recommended */}
      <RecommendedForYou items={trending} />

      {/* 10. Why Foodie */}
      <WhyFoodie />
    </>
  );
}

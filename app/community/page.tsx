'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Heart, MessageCircle, Clock, Bookmark, Flame, Sparkles, ChefHat, Timer, Star, Check as CheckIcon } from 'lucide-react';
import { RecipeCard } from '@/components/community/RecipeCard';

/* ────────────────────────────────────────────────
   Category chip data
   ──────────────────────────────────────────────── */
const CATEGORIES = [
  { emoji: '🍛', label: 'Indian' },
  { emoji: '🍕', label: 'Italian' },
  { emoji: '🍜', label: 'Asian' },
  { emoji: '🍰', label: 'Dessert' },
  { emoji: '🥗', label: 'Healthy' },
  { emoji: '🥘', label: 'Dinner' },
  { emoji: '🍳', label: 'Breakfast' },
  { emoji: '🥤', label: 'Drinks' },
  { emoji: '🍔', label: 'Fast Food' },
  { emoji: '🍞', label: 'Bakery' },
];

/* ────────────────────────────────────────────────
   Placeholder trending cards when no recipes exist (using real food photos)
   ──────────────────────────────────────────────── */
const PLACEHOLDER_TRENDING = [
  { id: 'p1', title: 'Authentic Butter Chicken', cuisine: 'Indian', prep_time: '45 min', difficulty: 'Medium', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80', likes: 234, comments: 18, author: 'Chef Raj', verified: true },
  { id: 'p2', title: 'Wood-Fired Margherita', cuisine: 'Italian', prep_time: '30 min', difficulty: 'Easy', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', likes: 189, comments: 24, author: 'Maria Rossi', verified: true },
  { id: 'p3', title: 'Decadent Lava Cake', cuisine: 'Dessert', prep_time: '25 min', difficulty: 'Medium', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', likes: 312, comments: 42, author: 'Sweet Tooth', verified: false },
  { id: 'p4', title: 'Spicy Pad Thai', cuisine: 'Asian', prep_time: '20 min', difficulty: 'Easy', imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80', likes: 167, comments: 15, author: 'Li Wei', verified: true },
];

export default function CommunityPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    // Load recipes from localStorage (no database required)
    try {
      const stored = localStorage.getItem('community_recipes');
      if (stored) {
        setRecipes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recipes from localStorage', e);
    }
    setLoading(false);
  }, []);

  /* ── Filtering ── */
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        !activeCategory ||
        (r.cuisine && r.cuisine.toLowerCase() === activeCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, activeCategory]);

  /* ── Trending: top recipes by likes ── */
  const trendingRecipes = useMemo(() => {
    return [...recipes]
      .filter((r) => (r.likes_count || 0) > 0)
      .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      .slice(0, 4);
  }, [recipes]);

  const hasTrending = trendingRecipes.length > 0;

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#FDF8F3] dark:bg-[#151515] transition-colors duration-500">

      {/* ═══════════════════════════════════════════════
          COMPACT HERO SECTION  (~35-40% smaller)
          ═══════════════════════════════════════════════ */}
      <section className="container mt-6 md:mt-8 lg:mt-12 mb-6 md:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[24px] p-6 md:p-10 lg:p-16
            bg-gradient-to-br from-[#FFF5EB] via-[#FFEEDD] to-[#FFF0E0]
            dark:from-[#1E1612] dark:via-[#1A1210] dark:to-[#201814]
            border border-[#F0DCC8] dark:border-[#2A2218]
            overflow-hidden"
        >
          {/* Warm radial glow — subtle & tighter */}
          <div className="absolute -top-10 -right-10 w-[300px] h-[300px] rounded-full bg-[#FF6B00]/[0.06] dark:bg-[#FF6B00]/[0.04] blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-[250px] h-[250px] rounded-full bg-[#FF8C40]/[0.05] dark:bg-[#FF8C40]/[0.03] blur-[60px] pointer-events-none" />

          {/* Decorative food elements — positioned in corners, tasteful & compact */}
          <div className="absolute top-3 left-4 text-2xl opacity-[0.12] dark:opacity-[0.08] pointer-events-none select-none">🍕</div>
          <div className="absolute top-4 right-6 text-xl opacity-[0.12] dark:opacity-[0.08] pointer-events-none select-none">🌶️</div>
          <div className="absolute bottom-3 left-8 text-xl opacity-[0.10] dark:opacity-[0.06] pointer-events-none select-none">🥑</div>
          <div className="absolute bottom-4 right-4 text-2xl opacity-[0.12] dark:opacity-[0.08] pointer-events-none select-none">🍰</div>
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-6 text-lg opacity-[0.08] dark:opacity-[0.05] pointer-events-none select-none">🍋</div>
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-8 text-lg opacity-[0.08] dark:opacity-[0.05] pointer-events-none select-none">🍜</div>

          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23FF6B00\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Cg%3E%3C/svg%3E")',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-serif text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.18] tracking-tight
                  text-[#2C1810] dark:text-[#F5EDE4] mb-5"
              >
                Welcome to the{' '}
                <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
                  Foodies
                </span>{' '}
                Community
              </motion.h1>

              {/* Statistics Row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex items-center justify-center md:justify-start gap-4 mb-6 text-[13px] md:text-sm font-medium text-[#7A6B5E] dark:text-[#A89888]"
              >
                <div className="flex items-center gap-1.5 bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/40 dark:border-white/5">
                  <span className="text-base">👨‍🍳</span>
                  <span>15K+ Recipes</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/40 dark:border-white/5">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>120K Members</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/40 dark:border-white/5 hidden sm:flex">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>4.9 Rating</span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm md:text-base leading-relaxed
                  text-[#7A6B5E] dark:text-[#A89888] max-w-md md:max-w-lg"
              >
                Discover homemade recipes from passionate cooks around the world.
              </motion.p>
            </div>

            {/* Decorative illustration cluster — right side on desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden md:flex items-center justify-center flex-shrink-0"
            >
              <div className="relative w-[140px] h-[140px]">
                {/* Central glow */}
                <div className="absolute inset-0 rounded-full bg-[#FF6B00]/[0.08] dark:bg-[#FF6B00]/[0.06] blur-[20px]" />
                {/* Decorative ring */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#FF6B00]/[0.15] dark:border-[#FF6B00]/[0.10]" />
                {/* Food emojis arranged in a ring */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-2xl">🍳</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-2xl">🥘</span>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-2xl">🍕</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-2xl">🍰</span>
                </motion.div>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-lg shadow-[#FF6B00]/20">
                    <ChefHat className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEARCH BAR — Below hero, standalone
          ═══════════════════════════════════════════════ */}
      <section className="container mb-5 md:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={`relative transition-all duration-400 ${
            searchFocused ? 'scale-[1.01]' : ''
          }`}>
            <div className={`absolute -inset-[2px] rounded-2xl transition-all duration-400 ${
              searchFocused
                ? 'bg-gradient-to-r from-[#FF6B00]/30 via-[#FF8C40]/20 to-[#FF6B00]/30 opacity-100 blur-[1px]'
                : 'opacity-0'
            }`} />
            <div className="relative flex items-center">
              <Search className={`absolute left-5 w-5 h-5 transition-colors duration-300 ${
                searchFocused ? 'text-[#FF6B00]' : 'text-[#B0A090] dark:text-[#6A5A4A]'
              }`} />
              <input
                type="text"
                placeholder="Search recipes, ingredients, cuisines or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-14 pr-5 py-3.5 rounded-2xl text-[15px]
                  bg-white/90 dark:bg-[#1A1410]/90
                  backdrop-blur-xl
                  border border-[#E8D8C8] dark:border-[#2A2218]
                  text-[#2C1810] dark:text-[#F5EDE4]
                  placeholder:text-[#B0A090] dark:placeholder:text-[#5A4A3A]
                  focus:outline-none
                  transition-all duration-300
                  shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]
                  focus:shadow-[0_4px_24px_rgba(255,107,0,0.1)] dark:focus:shadow-[0_4px_24px_rgba(255,107,0,0.08)]"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          CATEGORY CHIPS — improved spacing & hover
          ═══════════════════════════════════════════════ */}
      <section className="container mb-7 md:mb-9">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-2.5 md:gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
        >
          {/* "All" chip */}
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[13px] md:text-sm font-semibold
              transition-all duration-300 border whitespace-nowrap shadow-sm
              ${!activeCategory
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white border-transparent shadow-[0_4px_16px_rgba(255,107,0,0.3)] scale-[1.03]'
                : 'bg-white dark:bg-[#1E1612] text-[#7A6B5E] dark:text-[#A89888] border-[#EDE5DA] dark:border-[#2A2218] hover:border-[#FF6B00]/40 hover:text-[#FF6B00] dark:hover:text-[#FF8C40] hover:bg-[#FFF5EB] dark:hover:bg-[#251A10] hover:shadow-[0_4px_16px_rgba(255,107,0,0.1)] hover:-translate-y-0.5'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            All
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
              className={`flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[13px] md:text-sm font-semibold
                transition-all duration-300 border whitespace-nowrap shadow-sm
                ${activeCategory === cat.label
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white border-transparent shadow-[0_4px_16px_rgba(255,107,0,0.3)] scale-[1.03]'
                  : 'bg-white dark:bg-[#1E1612] text-[#7A6B5E] dark:text-[#A89888] border-[#EDE5DA] dark:border-[#2A2218] hover:border-[#FF6B00]/40 hover:text-[#FF6B00] dark:hover:text-[#FF8C40] hover:bg-[#FFF5EB] dark:hover:bg-[#251A10] hover:shadow-[0_4px_16px_rgba(255,107,0,0.1)] hover:-translate-y-0.5'
                }`}
            >
              <span className="text-base leading-none">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          🔥 TRENDING RECIPES — always visible
          ═══════════════════════════════════════════════ */}
      <section className="container mb-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl
              bg-gradient-to-br from-[#FF6B00]/15 to-[#FF8C40]/10
              dark:from-[#FF6B00]/20 dark:to-[#FF8C40]/10">
              <Flame className="w-4.5 h-4.5 text-[#FF6B00]" />
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-bold
              text-[#2C1810] dark:text-[#F5EDE4]">
              Trending Recipes
            </h2>
          </div>

          {/* Horizontal scrollable on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1
            lg:grid lg:grid-cols-4 lg:overflow-visible">
            {hasTrending ? (
              /* Real trending recipe cards */
              trendingRecipes.map((recipe, i) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * i }}
                  className="flex-shrink-0 w-[260px] lg:w-auto"
                >
                  <Link href={`/community/${recipe.id}`} className="block group">
                    <div className="relative rounded-[18px] overflow-hidden
                      bg-[#FFFCF8] dark:bg-[#1E1612]
                      border border-[#EDE5DA] dark:border-[#2A2218]
                      shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.25)]
                      hover:shadow-[0_10px_36px_rgba(255,107,0,0.12)] dark:hover:shadow-[0_10px_36px_rgba(255,107,0,0.16)]
                      hover:-translate-y-1 transition-all duration-400 ease-out">

                      <div className="relative aspect-[4/3] overflow-hidden">
                        {recipe.image_urls && recipe.image_urls.length > 0 ? (
                          <img
                            src={recipe.image_urls[0]}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-600 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#FFF0E0] to-[#FFD4AD] dark:from-[#2A1F14] dark:to-[#251A10] flex items-center justify-center">
                            <span className="text-4xl opacity-50">🍽️</span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />

                        {/* Trending badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5
                          bg-[#FF6B00]/90 backdrop-blur-sm rounded-full">
                          <Flame className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-bold text-white tracking-wide uppercase">Trending</span>
                        </div>

                        {/* Difficulty badge */}
                        {recipe.difficulty && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/85 dark:bg-black/55 backdrop-blur-sm rounded-full text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                            {recipe.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5">
                        <h3 className="font-serif font-bold text-[15px] leading-snug line-clamp-1
                          text-[#2C1810] dark:text-[#F5EDE4]
                          group-hover:text-[#FF6B00] transition-colors duration-300">
                          {recipe.title}
                        </h3>

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5.5 h-5.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold
                              bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                              {recipe.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-[11px] font-medium text-[#7A6B5E] dark:text-[#A89888] truncate max-w-[70px]">
                              {recipe.profiles?.full_name || 'Chef'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-[#9A8A7A] dark:text-[#7A6A5A]">
                            <div className="flex items-center gap-0.5">
                              <Heart className="w-3 h-3" />
                              <span className="text-[10px] font-semibold">{recipe.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <MessageCircle className="w-3 h-3" />
                              <span className="text-[10px] font-semibold">{recipe.comments_count || 0}</span>
                            </div>
                            {recipe.prep_time && (
                              <div className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-semibold">{recipe.prep_time}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              /* Placeholder trending cards */
              PLACEHOLDER_TRENDING.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * i }}
                  className="flex-shrink-0 w-[260px] lg:w-auto"
                >
                  <div className="relative rounded-[18px] overflow-hidden
                    bg-[#FFFCF8] dark:bg-[#1E1612]
                    border border-[#EDE5DA] dark:border-[#2A2218]
                    shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.25)]
                    hover:shadow-[0_10px_36px_rgba(255,107,0,0.10)] dark:hover:shadow-[0_10px_36px_rgba(255,107,0,0.12)]
                    hover:-translate-y-1 transition-all duration-400 ease-out
                    group cursor-pointer"
                    onClick={() => {}}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#FFF5EB] dark:bg-[#201814]">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5
                        bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full">
                        <Star className="w-3 h-3 text-[#FF6B00] fill-[#FF6B00]" />
                        <span className="text-[10px] font-bold text-gray-800 dark:text-gray-100 tracking-wide uppercase">Top Rated</span>
                      </div>

                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                        {item.difficulty}
                      </span>
                    </div>

                    <div className="p-3.5">
                      <h3 className="font-serif font-bold text-[15px] leading-snug line-clamp-1
                        text-[#2C1810] dark:text-[#F5EDE4]
                        group-hover:text-[#FF6B00] transition-colors duration-300">
                        {item.title}
                      </h3>

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5.5 h-5.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold
                            bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-200">
                            {item.author[0]}
                          </div>
                          <span className="text-[11px] font-medium text-[#7A6B5E] dark:text-[#A89888] truncate max-w-[70px] flex items-center gap-1">
                            {item.author}
                            {item.verified && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center"><CheckIcon className="w-2 h-2 text-white"/></span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[#B0A090] dark:text-[#6A5A4A]">
                          <div className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3 text-red-500/70" />
                            <span className="text-[10px] font-semibold">{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-[#FF6B00]/70" />
                            <span className="text-[10px] font-semibold">{item.prep_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* "Be the first" overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-400
                      flex items-center justify-center">
                      <Link href="/community/new" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B00] text-white font-bold text-sm shadow-xl hover:scale-105 transition-transform btn-ripple">
                        <Plus className="w-4 h-4" />
                        Share Yours
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          LATEST RECIPES
          ═══════════════════════════════════════════════ */}
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {(recipes.length > 0 || loading) && (
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl
                bg-gradient-to-br from-[#FF6B00]/15 to-[#FF8C40]/10
                dark:from-[#FF6B00]/20 dark:to-[#FF8C40]/10">
                <Sparkles className="w-4.5 h-4.5 text-[#FF6B00]" />
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-bold
                text-[#2C1810] dark:text-[#F5EDE4]">
                Latest Recipes
              </h2>
            </div>
          )}

          {loading ? (
            /* Skeleton Loading */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-[18px] overflow-hidden
                  bg-[#FFFCF8] dark:bg-[#1E1612]
                  border border-[#EDE5DA] dark:border-[#2A2218]">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#F0E4D8] to-[#E8D8C8] dark:from-[#251A10] dark:to-[#1E1612] animate-pulse" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-[#EDE5DA] dark:bg-[#2A2218] rounded-lg w-3/4 animate-pulse" />
                    <div className="h-3 bg-[#EDE5DA] dark:bg-[#2A2218] rounded-lg w-full animate-pulse" />
                    <div className="h-3 bg-[#EDE5DA] dark:bg-[#2A2218] rounded-lg w-2/3 animate-pulse" />
                    <div className="pt-2.5 border-t border-[#EDE5DA] dark:border-[#2A2218] flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#EDE5DA] dark:bg-[#2A2218] animate-pulse" />
                        <div className="h-3 w-16 bg-[#EDE5DA] dark:bg-[#2A2218] rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={index} />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            /* No search/filter results */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6 rounded-[20px]
                bg-[#FFFCF8] dark:bg-[#1E1612]
                border border-[#EDE5DA] dark:border-[#2A2218]"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-serif text-lg font-bold text-[#2C1810] dark:text-[#F5EDE4] mb-2">
                No recipes found
              </h3>
              <p className="text-sm text-[#7A6B5E] dark:text-[#A89888] max-w-sm mx-auto">
                Try different keywords or explore another category.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory(null); }}
                className="mt-5 px-5 py-2 rounded-full text-sm font-semibold
                  bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20
                  transition-colors duration-300"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            /* Empty State — No recipes at all */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 px-6 rounded-[22px]
                bg-gradient-to-b from-[#FFFCF8] to-[#FFF5EB]
                dark:from-[#1E1612] dark:to-[#1A1210]
                border border-[#EDE5DA] dark:border-[#2A2218]
                relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#FF6B00]/[0.04] dark:bg-[#FF6B00]/[0.03] blur-[60px] pointer-events-none" />

              <div className="relative z-10">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-5xl mb-5"
                >
                  🍳
                </motion.div>

                <h3 className="font-serif text-xl md:text-2xl font-bold
                  text-[#2C1810] dark:text-[#F5EDE4] mb-3">
                  The community is waiting for the first masterpiece.
                </h3>
                <p className="text-sm md:text-base text-[#7A6B5E] dark:text-[#A89888] max-w-md mx-auto mb-8 leading-relaxed">
                  Share your favourite homemade recipe and inspire thousands of food lovers.
                </p>

                <Link
                  href="/community/new"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold text-white
                    bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]
                    shadow-[0_6px_24px_rgba(255,107,0,0.3)]
                    hover:shadow-[0_8px_32px_rgba(255,107,0,0.45)]
                    hover:-translate-y-0.5
                    transition-all duration-300
                    btn-ripple"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Share Your Recipe
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChefHat, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-[20px] overflow-hidden flex flex-col h-full
        bg-[#FFFCF8] dark:bg-[#1E1612]
        border border-[#EDE5DA] dark:border-[#2A2218]
        shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)]
        hover:shadow-[0_16px_48px_rgba(255,107,0,0.15)] dark:hover:shadow-[0_16px_48px_rgba(255,107,0,0.2)]
        hover:-translate-y-2
        transition-all duration-500 ease-[0.25,0.46,0.45,0.94]"
    >
      {/* Image Section */}
      <Link href={`/community/${recipe.id}`} className="block relative aspect-[4/3] overflow-hidden">
        {recipe.image_urls && recipe.image_urls.length > 0 ? (
          <img
            src={recipe.image_urls[0]}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-[0.25,0.46,0.45,0.94]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FFF0E0] via-[#FFE4CC] to-[#FFD4AD] dark:from-[#2A1F14] dark:via-[#1E1612] dark:to-[#251A10] flex items-center justify-center">
            <div className="text-5xl opacity-60">🍽️</div>
          </div>
        )}

        {/* Gradient overlay on image bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Badges Container Top-Left */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-2">
          {recipe.difficulty && (
            <span className="px-3 py-1 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide text-gray-800 dark:text-gray-100 shadow-sm uppercase">
              {recipe.difficulty}
            </span>
          )}
          {/* Example dynamic badge based on index for demo purposes */}
          {index === 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-[11px] font-bold tracking-wide shadow-sm uppercase flex items-center gap-1">
              <span>⭐</span> Recipe of the Day
            </span>
          )}
          {index === 1 && (
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-[11px] font-bold tracking-wide shadow-sm uppercase flex items-center gap-1">
              <span>🚀</span> New
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          className="absolute top-3.5 right-3.5 w-10 h-10 flex items-center justify-center rounded-full
            bg-white/80 dark:bg-black/50 backdrop-blur-md
            opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
            transition-all duration-300 ease-out
            hover:bg-[#FF6B00] hover:text-white text-gray-600 dark:text-gray-300
            shadow-[0_4px_12px_rgba(0,0,0,0.1)] btn-ripple"
          onClick={(e) => e.preventDefault()}
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Cuisine tag on image */}
        {recipe.cuisine && (
          <span className="absolute bottom-3.5 left-3.5 px-3 py-1 bg-[#FF6B00]/90 backdrop-blur-sm rounded-full text-[11px] font-semibold text-white shadow-sm">
            {recipe.cuisine}
          </span>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/community/${recipe.id}`} className="block group/title">
          <h3 className="font-serif font-bold text-lg leading-snug line-clamp-2
            text-[#2C1810] dark:text-[#F5EDE4]
            group-hover/title:text-[#FF6B00] transition-colors duration-300">
            {recipe.title}
          </h3>
        </Link>

        {recipe.description && (
          <p className="mt-2 text-sm line-clamp-2 leading-relaxed
            text-[#7A6B5E] dark:text-[#A89888]">
            {recipe.description}
          </p>
        )}

        {/* Meta info row */}
        <div className="mt-auto pt-4 flex flex-wrap items-center gap-3 text-xs font-medium
          text-[#9A8A7A] dark:text-[#8A7A6A]">
          {recipe.prep_time && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-[#FFF5EB] dark:bg-[#2A1F14]">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{recipe.prep_time}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mt-4 pt-4 border-t border-[#EDE5DA] dark:border-[#2A2218]">
          <div className="flex items-center justify-between">
            {/* Creator */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white shadow-sm ring-2 ring-white dark:ring-[#1E1612]">
                {recipe.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-semibold text-[#4A3A2E] dark:text-[#C8B8A8] truncate max-w-[120px] flex items-center gap-1">
                {recipe.profiles?.full_name || 'Unknown Chef'}
                {/* Mock verified badge for some users based on likes */}
                {((recipe.likes_count || 0) > 5 || index % 2 === 0) && (
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#9A8A7A] dark:text-[#8A7A6A] hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer group/like">
                <Heart className="w-4 h-4 group-hover/like:scale-110 transition-transform" />
                <span className="text-xs font-semibold">{recipe.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-[#9A8A7A] dark:text-[#8A7A6A] hover:text-[#FF6B00] transition-colors cursor-pointer group/comment">
                <MessageCircle className="w-4 h-4 group-hover/comment:scale-110 transition-transform" />
                <span className="text-xs font-semibold">{recipe.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

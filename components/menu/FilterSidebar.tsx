'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown } from 'lucide-react';
import type { Category, MenuFilters } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface FilterSidebarProps {
  filters: MenuFilters;
  categories: Category[];
  onUpdate: (partial: Partial<MenuFilters>) => void;
  onClear: () => void;
}

function Accordion({ title, isOpen, onToggle, children }: { title: React.ReactNode, isOpen: boolean, onToggle: () => void, children: React.ReactNode }) {
  return (
    <div className="border-b border-border-light dark:border-[#2A2A2A] py-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 font-serif font-bold text-base text-text-primary hover:text-[#FF6B00] transition-colors"
      >
        {title}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-muted" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-5 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterSidebar({ filters, categories, onUpdate, onClear }: FilterSidebarProps) {
  const PRICE_MAX = 2000;
  
  // Accordion states
  const [openSections, setOpenSections] = useState({
    diet: true,
    price: true,
    rating: true,
    cuisine: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-xl text-text-primary">Filters</h3>
        <button
          onClick={onClear}
          className="text-sm text-[#FF6B00] font-bold hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* Diet Type */}
      <Accordion title="Diet Type" isOpen={openSections.diet} onToggle={() => toggleSection('diet')}>
        <div className="space-y-2">
          {[
            { key: 'veg' as const, label: '🟢 Vegetarian', color: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
            { key: 'nonVeg' as const, label: '🔴 Non-Vegetarian', color: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
            { key: 'egg' as const, label: '🟡 Contains Egg', color: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
            { key: 'drink' as const, label: '🥤 Beverage', color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                filters[opt.key] ? opt.color : 'border-border dark:border-[#3F3F46] hover:border-[#FF6B00]/50 text-text-secondary'
              }`}
            >
              <input
                type="checkbox"
                checked={!!filters[opt.key]}
                onChange={(e) => onUpdate({ [opt.key]: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                filters[opt.key] ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-400 dark:border-gray-500'
              }`}>
                {filters[opt.key] && (
                  <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" />
                  </motion.svg>
                )}
              </div>
              {opt.label}
            </label>
          ))}
        </div>
      </Accordion>

      {/* Price Range */}
      <Accordion title="Price Range" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
        <div className="space-y-4">
          <div className="flex justify-between text-base font-bold text-[#FF6B00]">
            <span>{formatPrice(filters.priceMin ?? 0)}</span>
            <span>{formatPrice(filters.priceMax ?? PRICE_MAX)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={50}
            value={filters.priceMax ?? PRICE_MAX}
            onChange={(e) => onUpdate({ priceMax: Number(e.target.value) })}
            className="w-full accent-[#FF6B00]"
          />
          <div className="flex justify-between text-xs text-text-muted font-semibold">
            <span>₹0</span>
            <span>₹{PRICE_MAX}</span>
          </div>
        </div>
      </Accordion>

      {/* Rating */}
      <Accordion title="Minimum Rating" isOpen={openSections.rating} onToggle={() => toggleSection('rating')}>
        <div className="flex flex-wrap gap-2.5">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => onUpdate({ rating: r })}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                filters.rating === r
                  ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-orange'
                  : 'bg-bg-card text-text-secondary border-border dark:border-[#3F3F46] hover:border-[#FF6B00] hover:text-[#FF6B00]'
              }`}
            >
              {r === 0 ? 'All' : (
                <>
                  <Star className="w-3.5 h-3.5 fill-current" />{r}+
                </>
              )}
            </button>
          ))}
        </div>
      </Accordion>

      {/* Categories */}
      {categories.length > 0 && (
        <Accordion title="Cuisine" isOpen={openSections.cuisine} onToggle={() => toggleSection('cuisine')}>
          <div className="space-y-1.5 max-h-60 overflow-y-auto drawer-scroll pr-2">
            {categories.map((cat) => {
              const active = filters.categories?.includes(cat.slug);
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                    active ? 'bg-orange-50 dark:bg-orange-950/30 text-[#FF6B00] font-bold' : 'text-text-secondary hover:bg-bg-secondary dark:hover:bg-[#262626]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!active}
                    onChange={(e) => {
                      const cats = filters.categories ?? [];
                      if (e.target.checked) {
                        onUpdate({ categories: [...cats, cat.slug] });
                      } else {
                        onUpdate({ categories: cats.filter((c) => c !== cat.slug) });
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    active ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-400 dark:border-gray-500'
                  }`}>
                    {active && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  {cat.name}
                </label>
              );
            })}
          </div>
        </Accordion>
      )}
    </div>
  );
}

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Share2, Star, Clock, MapPin, Flame, ChefHat,
  Award, Plus, Minus, ShoppingCart, Sparkles, Leaf, Wheat,
  Droplets, Zap, Cookie, Info, MessageSquare, Store, Check,
} from 'lucide-react';
import type { FoodItem } from '@/types';
import { DietBadge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FoodDetailDrawerProps {
  item: FoodItem;
  allItems: FoodItem[];
  onClose: () => void;
}

// ─── Mock Data Generators ───
function getIngredients(item: FoodItem) {
  const vegIngredients = [
    { name: 'Paneer', emoji: '🧀' },
    { name: 'Butter', emoji: '🧈' },
    { name: 'Tomatoes', emoji: '🍅' },
    { name: 'Cashews', emoji: '🥜' },
    { name: 'Cream', emoji: '🥛' },
    { name: 'Spices', emoji: '🌶️' },
    { name: 'Herbs', emoji: '🌿' },
    { name: 'Garlic', emoji: '🧄' },
  ];
  const nonVegIngredients = [
    { name: 'Chicken', emoji: '🍗' },
    { name: 'Yogurt', emoji: '🥛' },
    { name: 'Onions', emoji: '🧅' },
    { name: 'Ginger', emoji: '🫚' },
    { name: 'Spices', emoji: '🌶️' },
    { name: 'Oil', emoji: '🫒' },
    { name: 'Rice', emoji: '🍚' },
    { name: 'Saffron', emoji: '🌼' },
  ];
  const base = item.is_veg ? vegIngredients : nonVegIngredients;
  const count = 5 + (item.id.charCodeAt(0) % 3);
  return base.slice(0, count);
}

function getNutrition(item: FoodItem) {
  const cal = item.calories || (200 + (item.id.charCodeAt(0) * 3) % 400);
  return [
    { label: 'Calories', value: `${cal}`, unit: 'kcal', icon: Zap, color: 'text-orange-500' },
    { label: 'Protein', value: `${8 + (item.id.charCodeAt(1) * 2) % 25}`, unit: 'g', icon: Leaf, color: 'text-green-500' },
    { label: 'Carbs', value: `${20 + (item.id.charCodeAt(2) * 3) % 40}`, unit: 'g', icon: Wheat, color: 'text-amber-500' },
    { label: 'Fat', value: `${5 + (item.id.charCodeAt(0)) % 20}`, unit: 'g', icon: Droplets, color: 'text-blue-500' },
    { label: 'Sugar', value: `${2 + (item.id.charCodeAt(1)) % 15}`, unit: 'g', icon: Cookie, color: 'text-pink-500' },
    { label: 'Fiber', value: `${1 + (item.id.charCodeAt(2)) % 8}`, unit: 'g', icon: Leaf, color: 'text-emerald-500' },
  ];
}

function getDescription(item: FoodItem) {
  const base = item.description || 'A delicious dish crafted with care.';
  return `${base}\n\nPrepared with the finest ingredients, this dish offers a perfect balance of flavours and textures. Each bite delivers a harmonious blend of spices that will leave you craving more. Our chefs use traditional recipes passed down through generations, ensuring an authentic taste experience.\n\nPerfect for a hearty meal, family gatherings, or when you simply want to treat yourself to something special. Best enjoyed fresh and hot with our signature accompaniments.`;
}

function getMockReviews(itemId: string) {
  const names = ['Priya S.', 'Rahul M.', 'Ananya K.', 'Vikram P.', 'Sneha R.'];
  const comments = [
    'Absolutely delicious! The flavours are perfectly balanced. Will order again for sure.',
    'Best dish I\'ve had in a long time. Fresh ingredients and amazing taste!',
    'Great portion size and excellent taste. Delivery was quick too!',
    'My family loved it! Ordering this every weekend now.',
    'Slightly spicy for me but overall fantastic quality and presentation.',
  ];
  const seed = itemId.charCodeAt(0);
  return names.slice(0, 3 + (seed % 2)).map((name, i) => ({
    id: `rev-${i}`,
    name,
    rating: 4 + ((seed + i) % 2) * 0.5,
    comment: comments[(seed + i) % comments.length],
    date: `${1 + (i * 3)} days ago`,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EA580C&color=fff&size=40`,
  }));
}

const CUSTOMIZATIONS = [
  { label: 'Extra Cheese', price: 30, emoji: '🧀' },
  { label: 'Extra Butter', price: 20, emoji: '🧈' },
  { label: 'Extra Paneer', price: 40, emoji: '🧊' },
  { label: 'Extra Sauce', price: 15, emoji: '🫙' },
  { label: 'Extra Garlic Bread', price: 49, emoji: '🍞' },
];

const SPICE_LEVELS = [
  { value: 'mild', label: 'Mild', emoji: '🌶️', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', emoji: '🌶️🌶️', color: 'text-yellow-600' },
  { value: 'spicy', label: 'Spicy', emoji: '🌶️🌶️🌶️', color: 'text-orange-600' },
  { value: 'extra-spicy', label: 'Extra Spicy', emoji: '🌶️🌶️🌶️🌶️', color: 'text-red-600' },
];

export function FoodDetailDrawer({ item, allItems, onClose }: FoodDetailDrawerProps) {
  const { addItem, triggerFlyAnimation } = useCart();
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [imgError, setImgError] = useState(false);

  const effectivePrice = getEffectivePrice(item.price, item.sale_price);
  const discountPercent = getDiscountPercent(item.price, item.sale_price);
  const deliveryTime = 15 + ((item.id.charCodeAt(0) * 7) % 30);
  const distance = (1 + ((item.id.charCodeAt(1) * 3) % 8)).toFixed(1);
  const prepTime = 10 + ((item.id.charCodeAt(2) * 5) % 20);
  const reviewCount = 200 + ((item.id.charCodeAt(0) * 137) % 4800);
  const isBestSeller = item.order_count > 50 || item.rating >= 4.5;
  const isChefRecommended = item.rating >= 4.3 && ((item.id.charCodeAt(0) % 3) === 0);

  const ingredients = getIngredients(item);
  const nutrition = getNutrition(item);
  const description = getDescription(item);
  const reviews = getMockReviews(item.id);

  // Calculate total price
  const customizationTotal = Array.from(selectedCustomizations).reduce((sum, label) => {
    const c = CUSTOMIZATIONS.find((x) => x.label === label);
    return sum + (c?.price || 0);
  }, 0);
  const unitPrice = effectivePrice + customizationTotal;
  const totalPrice = unitPrice * quantity;

  // Similar dishes
  const similarDishes = allItems
    .filter((i) => i.id !== item.id && i.category_id === item.category_id)
    .slice(0, 6);

  // Frequently bought together
  const boughtTogether = allItems
    .filter((i) => i.id !== item.id && i.category_id !== item.category_id)
    .slice(0, 4);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleFavourite = useCallback(() => {
    setIsFavourite((prev) => !prev);
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 400);
    if (!isFavourite) toast.success('Added to favourites!', { icon: '❤️' });
  }, [isFavourite]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!', { icon: '📋' });
    } catch {
      toast.success('Share this dish with friends!', { icon: '🔗' });
    }
  }, []);

  const toggleCustomization = (label: string) => {
    setSelectedCustomizations((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleAddToCart = () => {
    addItem({
      food_item_id: item.id,
      name: item.name,
      image_url: item.image_url,
      price: unitPrice,
      is_veg: item.is_veg,
      is_egg: item.is_egg,
      selected_options: Array.from(selectedCustomizations).map((label) => ({
        option_id: label,
        option_name: 'Customization',
        value_id: label,
        value: label,
        price_modifier: CUSTOMIZATIONS.find((c) => c.label === label)?.price || 0,
      })),
    }, quantity);

    if (addBtnRef.current) {
      triggerFlyAnimation(addBtnRef.current, item.id);
    }

    toast.success(`${item.name} added to cart!`, { icon: '🛒' });
    onClose();
  };

  const handleQuickAdd = (quickItem: FoodItem) => {
    const price = getEffectivePrice(quickItem.price, quickItem.sale_price);
    addItem({
      food_item_id: quickItem.id,
      name: quickItem.name,
      image_url: quickItem.image_url,
      price,
      is_veg: quickItem.is_veg,
      is_egg: quickItem.is_egg,
      selected_options: [],
    });
    toast.success(`${quickItem.name} added!`, { icon: '🛒' });
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 drawer-overlay z-[60]"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <motion.div
        key="drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-bg-card z-[61] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── SCROLLABLE CONTENT ─── */}
        <div className="flex-1 overflow-y-auto drawer-scroll">

          {/* ─── SECTION 1: Hero Image ─── */}
          <div className="relative h-72 sm:h-80 overflow-hidden bg-bg-secondary">
            {item.image_url && !imgError ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                priority
                className="object-cover"
                sizes="500px"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 text-8xl">
                🍽️
              </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Top bar buttons */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
              {/* Close */}
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all"
                  aria-label="Share this dish"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Favourite */}
                <button
                  onClick={handleFavourite}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all"
                  aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      isFavourite ? 'fill-red-500 text-red-500' : 'text-white'
                    } ${heartAnimating ? 'heart-pop' : ''}`}
                  />
                </button>
              </div>
            </div>

            {/* Discount badge on image */}
            {discountPercent && (
              <div className="absolute bottom-4 left-4 z-10">
                <span className="px-3 py-1.5 bg-[#FF6B00] text-white text-sm font-black rounded-full shadow-lg">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            {/* Image gallery dots (decorative) */}
            <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === 0 ? 'bg-white w-5' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ─── SECTION 2: Food Info ─── */}
          <div className="px-5 pt-5 pb-4 border-b border-border-light dark:border-[#2A2A2A]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DietBadge type={item.is_veg ? 'veg' : item.is_egg ? 'egg' : 'non-veg'} />
                  {isBestSeller && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wide rounded-full border border-amber-200 dark:border-amber-700">
                      <Award className="w-3 h-3" /> Best Seller
                    </span>
                  )}
                  {isChefRecommended && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wide rounded-full border border-purple-200 dark:border-purple-700">
                      <ChefHat className="w-3 h-3" /> Chef&apos;s Pick
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-bold text-text-primary leading-tight">
                  {item.name}
                </h2>
              </div>
            </div>

            {/* Rating, Delivery, Distance row */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 bg-green-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                  <Star className="w-3 h-3 fill-white" />
                  {item.rating.toFixed(1)}
                </div>
                <span className="text-text-secondary text-xs">{reviewCount.toLocaleString()} reviews</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{deliveryTime} mins delivery</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{distance} km</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{prepTime} min prep</span>
              </div>
            </div>
          </div>

          {/* ─── SECTION 3: Price ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-text-primary">{formatPrice(effectivePrice)}</span>
              {item.sale_price && (
                <>
                  <span className="text-base text-text-muted line-through">{formatPrice(item.price)}</span>
                  <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                    Save {formatPrice(item.price - effectivePrice)}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF6B00]" />
              Use code <span className="font-bold text-[#FF6B00]">FOODIE20</span> for extra 20% off
            </p>
          </div>

          {/* ─── SECTION 4: Description ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#FF6B00]" /> About This Dish
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* ─── SECTION 5: Ingredients ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3">
              Key Ingredients
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {ingredients.map((ing) => (
                <div key={ing.name} className="ingredient-card">
                  <span className="text-2xl">{ing.emoji}</span>
                  <span className="text-xs font-medium text-text-secondary">{ing.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION 6: Nutrition ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3">
              Nutrition Info
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {nutrition.map((n) => (
                <div key={n.label} className="nutrition-card">
                  <n.icon className={`w-5 h-5 ${n.color} mx-auto mb-1`} />
                  <p className="text-lg font-bold text-text-primary">{n.value}<span className="text-xs font-normal text-text-muted ml-0.5">{n.unit}</span></p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold">{n.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION 7: Spice Level ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3">
              Spice Level
            </h3>
            <div className="flex flex-wrap gap-2">
              {SPICE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSpiceLevel(level.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                    spiceLevel === level.value
                      ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-orange'
                      : 'bg-bg-card dark:bg-[#262626] text-text-secondary border-border dark:border-[#3F3F46] hover:border-[#FF6B00] hover:text-[#FF6B00]'
                  }`}
                >
                  {level.emoji} {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── SECTION 8: Customizations ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3">
              Customise Your Dish
            </h3>
            <div className="space-y-2">
              {CUSTOMIZATIONS.map((c) => {
                const selected = selectedCustomizations.has(c.label);
                return (
                  <button
                    key={c.label}
                    onClick={() => toggleCustomization(c.label)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                      selected
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-950/30'
                        : 'border-border-light dark:border-[#2A2A2A] hover:border-[#FF6B00]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{c.emoji}</span>
                      <span className={`text-sm font-medium ${selected ? 'text-[#FF6B00]' : 'text-text-primary'}`}>
                        {c.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${selected ? 'text-[#FF6B00]' : 'text-text-muted'}`}>
                        +{formatPrice(c.price)}
                      </span>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        selected ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── SECTION 9: Quantity ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3">
              Quantity
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-bg-secondary dark:bg-[#262626] rounded-2xl p-1.5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-card dark:bg-[#1E1E1E] text-[#FF6B00] border border-border dark:border-[#3F3F46] hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition-all disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </motion.button>
                <motion.span
                  key={quantity}
                  initial={{ scale: 1.3, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-10 text-center font-bold text-xl text-text-primary tabular-nums"
                >
                  {quantity}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FF6B00] text-white hover:bg-[#E56000] transition-all"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </motion.button>
              </div>
              <div>
                <p className="text-xs text-text-muted">Total Price</p>
                <p className="text-lg font-bold text-[#FF6B00]">{formatPrice(totalPrice)}</p>
              </div>
            </div>
          </div>

          {/* ─── SECTION 10: Special Instructions ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF6B00]" /> Special Instructions
            </h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g., Less oil, No onion, Extra crispy..."
              rows={3}
              className="w-full px-4 py-3 border border-border dark:border-[#3F3F46] rounded-xl text-sm bg-bg-card dark:bg-[#262626] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#FF6B00] transition-colors resize-none"
            />
          </div>

          {/* ─── SECTION 11: Reviews ─── */}
          <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3">
              Customer Reviews
            </h3>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-3.5 rounded-xl bg-bg-secondary dark:bg-[#262626] border border-border-light dark:border-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{review.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(review.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-text-muted ml-1">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION 12: Frequently Bought Together ─── */}
          {boughtTogether.length > 0 && (
            <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
              <h3 className="font-serif font-bold text-base text-text-primary mb-3">
                Frequently Bought Together
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {boughtTogether.map((btItem) => (
                  <div
                    key={btItem.id}
                    className="flex-shrink-0 w-36 rounded-xl overflow-hidden border border-border-light dark:border-[#2A2A2A] bg-bg-card"
                  >
                    <div className="relative h-24 bg-bg-secondary">
                      {btItem.image_url ? (
                        <Image src={btItem.image_url} alt={btItem.name} fill className="object-cover" sizes="150px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-text-primary line-clamp-1">{btItem.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-bold text-text-primary">{formatPrice(getEffectivePrice(btItem.price, btItem.sale_price))}</span>
                        <button
                          onClick={() => handleQuickAdd(btItem)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#FF6B00] text-white hover:bg-[#E56000] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SECTION 13: Similar Dishes ─── */}
          {similarDishes.length > 0 && (
            <div className="px-5 py-4 border-b border-border-light dark:border-[#2A2A2A]">
              <h3 className="font-serif font-bold text-base text-text-primary mb-3">
                Similar Dishes
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {similarDishes.map((simItem) => (
                  <div
                    key={simItem.id}
                    className="flex-shrink-0 w-36 rounded-xl overflow-hidden border border-border-light dark:border-[#2A2A2A] bg-bg-card"
                  >
                    <div className="relative h-24 bg-bg-secondary">
                      {simItem.image_url ? (
                        <Image src={simItem.image_url} alt={simItem.name} fill className="object-cover" sizes="150px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-text-primary line-clamp-1">{simItem.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-semibold text-text-primary">{simItem.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-bold text-text-primary">{formatPrice(getEffectivePrice(simItem.price, simItem.sale_price))}</span>
                        <button
                          onClick={() => handleQuickAdd(simItem)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#FF6B00] text-white hover:bg-[#E56000] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SECTION 14: Restaurant Info ─── */}
          <div className="px-5 py-4">
            <h3 className="font-serif font-bold text-base text-text-primary mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#FF6B00]" /> Restaurant Info
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary dark:bg-[#262626] border border-border-light dark:border-[#2A2A2A]">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF7A1A] flex items-center justify-center shadow-orange flex-shrink-0">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm">Foodie Kitchen</p>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.5
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {distance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {deliveryTime} min
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-700 flex-shrink-0">
                Open
              </span>
            </div>
          </div>

          {/* Bottom spacer for sticky bar */}
          <div className="h-24" />
        </div>

        {/* ─── STICKY BOTTOM BAR ─── */}
        <div className="flex-shrink-0 border-t border-border dark:border-[#2A2A2A] bg-bg-card px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-4">
            {/* Price Summary */}
            <div className="flex-shrink-0">
              <p className="text-xs text-text-muted">
                {quantity} {quantity === 1 ? 'item' : 'items'}
              </p>
              <p className="text-xl font-bold text-text-primary">{formatPrice(totalPrice)}</p>
            </div>

            {/* Add to Cart */}
            <motion.button
              ref={addBtnRef}
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              className="btn-ripple flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF6B00] text-white rounded-2xl text-base font-bold hover:bg-[#E56000] transition-all shadow-orange hover:shadow-glow-orange"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

'use client';

import React, { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Flame, Heart, Clock, MapPin } from 'lucide-react';
import type { FoodItem } from '@/types';
import { DietBadge } from '@/components/ui/Badge';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { useCart } from '@/context/CartContext';
import { useFavourites } from '@/context/FavouritesContext';
import { useFoodDrawer } from '@/context/FoodDrawerContext';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FoodItemCardProps {
  item: FoodItem;
  onCustomize?: (item: FoodItem) => void;
  onOpenDrawer?: (item: FoodItem) => void; // Keeping for backwards compatibility if needed
}

export function FoodItemCard({ item, onCustomize, onOpenDrawer }: FoodItemCardProps) {
  const { addItem, isInCart, getItemQuantity, updateQuantity, state, triggerFlyAnimation } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();
  const { openDrawer } = useFoodDrawer();
  
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [imgError, setImgError] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const effectivePrice = getEffectivePrice(item.price, item.sale_price);
  const discountPercent = getDiscountPercent(item.price, item.sale_price);
  const inCart = isInCart(item.id);
  const qty = getItemQuantity(item.id);
  const isFav = isFavourite(item.id);

  // Find the cart item for this food item (first match)
  const cartItem = state.items.find((i) => i.food_item_id === item.id);

  // Simulated delivery info (based on item id hash for variety)
  const deliveryTime = 15 + ((item.id.charCodeAt(0) * 7) % 30);
  const distance = (1 + ((item.id.charCodeAt(1) * 3) % 8)).toFixed(1);
  const reviewCount = 200 + ((item.id.charCodeAt(0) * 137) % 4800);

  const handleCardClick = useCallback(() => {
    if (onOpenDrawer) {
      onOpenDrawer(item);
    } else {
      openDrawer(item);
    }
  }, [onOpenDrawer, openDrawer, item]);

  const handleFavourite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFav) {
      toggleFavourite(item.id);
      toast.success('Removed from Favorites 💔');
    } else {
      toggleFavourite(item.id);
      setHeartAnimating(true);
      setTimeout(() => setHeartAnimating(false), 400);
      toast.success('Added to Favorites ❤️');
      
      // Trigger particles
      const heartBtn = e.currentTarget as HTMLButtonElement;
      for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full bg-red-500 pointer-events-none';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.transform = 'translate(-50%, -50%)';
        heartBtn.appendChild(particle);
        
        const angle = (i * 60) * (Math.PI / 180);
        const distance = 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.animate([
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ], { duration: 400, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
        
        setTimeout(() => particle.remove(), 400);
      }
    }
  }, [isFav, toggleFavourite, item.id]);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // If item has options, open customization modal
    if (item.food_options && item.food_options.length > 0 && onCustomize) {
      onCustomize(item);
      return;
    }

    addItem({
      food_item_id: item.id,
      name: item.name,
      image_url: item.image_url,
      price: effectivePrice,
      is_veg: item.is_veg,
      is_egg: item.is_egg,
      selected_options: [],
    });

    // Trigger fly animation
    if (addBtnRef.current) {
      triggerFlyAnimation(addBtnRef.current, item.id);
    }

    toast.success(`${item.name} added to cart!`, {
      icon: '🛒',
    });
  };

  const soldOut = item.stock_status === 'sold_out';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group bg-bg-card rounded-[20px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col cursor-pointer relative"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.name}`}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-bg-secondary">
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {item.image_url && !imgError ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 text-6xl">
              🍽️
            </div>
          )}
        </motion.div>

        {/* Top Left — Discount Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <motion.span
              className="px-2.5 py-1 bg-[#FF6B00] text-white text-xs font-black rounded-full shadow-lg group-hover:animate-badge-pulse"
            >
              -{discountPercent}% OFF
            </motion.span>
          )}
          {item.rating >= 4.5 && (
            <span className="px-2 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3" /> Top Rated
            </span>
          )}
        </div>

        {/* Top Right — Heart/Favourite */}
        <button
          onClick={handleFavourite}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:bg-white dark:hover:bg-black/60 transition-all shadow-sm group/heart"
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isFav
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600 dark:text-gray-300 group-hover/heart:text-red-400 group-hover/heart:fill-red-400'
            } ${heartAnimating ? 'heart-pop' : ''}`}
          />
        </button>

        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-bold text-lg px-4 py-2 bg-black/60 rounded-xl">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Diet Badge */}
        <div className="mb-2">
          <DietBadge type={item.dietary_tags?.includes('drink') ? 'drink' : item.is_veg ? 'veg' : item.is_egg ? 'egg' : 'non-veg'} />
        </div>

        {/* Name */}
        <h3 className="font-serif font-bold text-text-primary text-base mb-1 line-clamp-2 leading-snug group-hover:text-[#FF6B00] transition-colors duration-300">
          {item.name}
        </h3>

        {/* Description */}
        <div className="flex-1">
          {item.description && (
            <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 mb-3">
              {item.description}
            </p>
          )}
        </div>

        {/* Rating + Reviews + Delivery */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-text-primary">{item.rating.toFixed(1)}</span>
            <span className="text-text-muted">({reviewCount.toLocaleString()})</span>
          </div>
          <span className="text-border hidden sm:inline">•</span>
          <div className="flex items-center gap-1 text-text-muted">
            <Clock className="w-3 h-3" />
            <span>{deliveryTime} mins</span>
          </div>
          <span className="text-border hidden sm:inline">•</span>
          <div className="flex items-center gap-1 text-text-muted">
            <MapPin className="w-3 h-3" />
            <span>{distance} km</span>
          </div>
        </div>

        {/* Price + Add Button */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-text-primary text-lg">{formatPrice(effectivePrice)}</span>
            {item.sale_price && (
              <span className="text-xs text-text-muted line-through">{formatPrice(item.price)}</span>
            )}
          </div>

          {soldOut ? (
            <span className="text-xs text-text-muted font-semibold">Unavailable</span>
          ) : inCart && cartItem ? (
            <div onClick={(e) => e.stopPropagation()}>
              <QuantitySelector
                size="sm"
                quantity={cartItem.quantity}
                onDecrease={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                onIncrease={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
              />
            </div>
          ) : (
            <motion.button
              ref={addBtnRef}
              id={`add-to-cart-${item.id}`}
              whileTap={{ scale: 0.92 }}
              initial={{ y: 4, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              onClick={handleAdd}
              className="btn-ripple flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-bold hover:bg-[#E56000] transition-all duration-300 shadow-orange hover:shadow-glow-orange group-hover:animate-glow"
            >
              <Plus className="w-4 h-4" />
              Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

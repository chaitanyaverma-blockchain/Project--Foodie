'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function FloatingCart() {
  const { itemCount, total } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300 && itemCount > 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Also show when items change
    if (itemCount > 0 && window.scrollY > 300) setVisible(true);
    if (itemCount === 0) setVisible(false);
    return () => window.removeEventListener('scroll', onScroll);
  }, [itemCount]);

  const openCart = () => {
    window.dispatchEvent(new CustomEvent('foodie:togglecart'));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-md"
        >
          <button
            onClick={openCart}
            className="w-full floating-bar rounded-2xl px-5 py-3.5 flex items-center justify-between group hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#FF6B00] rounded-xl flex items-center justify-center shadow-orange">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-[#1E1E1E] text-[#FF6B00] text-[10px] font-black rounded-full flex items-center justify-center shadow-sm border border-orange-100 dark:border-[#FF6B00]/30"
                >
                  {itemCount}
                </motion.span>
              </div>
              <div className="text-left">
                <p className="text-xs text-text-muted font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
                <p className="text-base font-bold text-text-primary">{formatPrice(total)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-bold group-hover:bg-[#E56000] transition-colors shadow-orange">
              View Cart
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

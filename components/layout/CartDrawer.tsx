'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Tag, ChevronRight, Bike } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Coupon } from '@/types';

const TIP_OPTIONS = [0, 20, 30, 50];

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const { state, itemCount, subtotal, discount, deliveryCharge, total, updateQuantity, removeItem, setCoupon, setTip } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const toggle = () => setIsOpen((p) => !p);
    window.addEventListener('foodie:togglecart', toggle);
    return () => window.removeEventListener('foodie:togglecart', toggle);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast.error('Invalid or expired coupon code.');
      setCouponLoading(false);
      return;
    }

    const coupon = data as Coupon;
    if (coupon.min_order && subtotal < coupon.min_order) {
      toast.error(`Minimum order of ${formatPrice(coupon.min_order)} required.`);
      setCouponLoading(false);
      return;
    }

    if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
      toast.error('This coupon has reached its usage limit.');
      setCouponLoading(false);
      return;
    }

    setCoupon(coupon);
    toast.success(`🎉 Coupon applied! Saving ${formatPrice(discount || coupon.value)}`);
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    toast.success('Coupon removed.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#181A20] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#2A2F38]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 dark:bg-orange-950/40 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-gray-900 dark:text-white">Your Cart</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button
                id="cart-close-btn"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-[#242934] transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {itemCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <div className="w-24 h-24 bg-orange-50 dark:bg-orange-950/30 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-gray-800 dark:text-white">Your cart is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add delicious dishes to get started!</p>
                  </div>
                  <Button onClick={() => setIsOpen(false)} variant="primary">
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-4">
                  <AnimatePresence>
                    {state.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 bg-gray-50 dark:bg-[#20242D] rounded-2xl p-3"
                      >
                        {/* Image */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{item.name}</h4>
                          {item.selected_options.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.selected_options.map((o) => o.value).join(', ')}
                            </p>
                          )}
                          <p className="text-sm font-bold text-[#FF6B00] mt-1">{formatPrice(item.price)}</p>
                        </div>

                        {/* Qty + Delete */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <QuantitySelector
                            size="sm"
                            quantity={item.quantity}
                            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Delivery Tip */}
                  <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bike className="w-4 h-4 text-[#FF6B00]" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tip your delivery partner</span>
                    </div>
                    <div className="flex gap-2">
                      {TIP_OPTIONS.map((tip) => (
                        <button
                          key={tip}
                          id={`tip-${tip}`}
                          onClick={() => setTip(tip)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                            state.tip === tip
                              ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                              : 'bg-white dark:bg-[#1E222B] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#353B46] hover:border-[#FF6B00] hover:text-[#FF6B00]'
                          }`}
                        >
                          {tip === 0 ? 'None' : `₹${tip}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="bg-gray-50 dark:bg-[#20242D] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-[#FF6B00]" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Promo Code</span>
                    </div>
                    {state.coupon ? (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 rounded-xl px-4 py-2.5">
                        <div>
                          <p className="text-sm font-bold text-green-700 dark:text-green-400">{state.coupon.code}</p>
                          <p className="text-xs text-green-600 dark:text-green-500">Saving {formatPrice(discount)}</p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          id="coupon-input"
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#3F3F46] rounded-xl text-sm font-mono focus:outline-none focus:border-[#FF6B00] bg-white dark:bg-[#18181B] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#9CA3AF] uppercase"
                        />
                        <Button
                          size="sm"
                          onClick={handleApplyCoupon}
                          loading={couponLoading}
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary + Checkout */}
            {itemCount > 0 && (
              <div className="border-t border-gray-100 dark:border-[#2A2F38] px-6 py-5 bg-white dark:bg-[#1E222B]">
                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(deliveryCharge)}</span>
                  </div>
                  {state.tip > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Delivery Tip</span>
                      <span>{formatPrice(state.tip)}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 dark:bg-[#353B46] my-2" />
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span className="text-[#FF6B00]">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href={user ? '/checkout' : '/auth/login?next=/checkout'}
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="primary" fullWidth size="lg" className="group">
                    {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

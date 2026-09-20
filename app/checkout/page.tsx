'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, CheckCircle, ChevronRight, Clock, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { AddressStep } from '@/components/checkout/AddressStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import type { SuccessMeta } from '@/components/checkout/PaymentStep';
import type { Address } from '@/types';
import Link from 'next/link';

const STEPS = [
  { id: 1, label: 'Delivery Address', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirmed', icon: CheckCircle },
];

// ─── Confetti burst (purely CSS/SVG animation) ────────────────
function SuccessConfetti() {
  const pieces = ['🎉', '🍕', '⭐', '🎊', '✨', '🍔', '🎈', '🍜'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {pieces.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${10 + i * 11}%`,
            top: '20%',
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: -120, opacity: 0, rotate: (i % 2 === 0 ? 180 : -180) }}
          transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Step 3: Beautiful Order Success ─────────────────────────
function OrderSuccessPanel({
  orderId,
  meta,
}: {
  orderId: string;
  meta: SuccessMeta;
}) {
  const [showConfetti, setShowConfetti] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const details = [
    { label: 'Order ID', value: orderId, mono: true },
    ...(meta.transactionId
      ? [{ label: 'Transaction ID', value: meta.transactionId, mono: true }]
      : []),
    { label: 'Payment Method', value: meta.paymentMethod, mono: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      className="relative bg-bg-card rounded-2xl p-8 sm:p-10 text-center shadow-card border border-border overflow-hidden"
    >
      {showConfetti && <SuccessConfetti />}

      {/* Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2, stiffness: 220, damping: 15 }}
        className="relative w-24 h-24 mx-auto mb-6"
      >
        <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/40 animate-ping opacity-30" />
        <div className="relative w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="font-serif text-3xl font-bold text-text-primary mb-2">
          Order Placed! 🎉
        </h2>
        <p className="text-text-secondary mb-6 max-w-sm mx-auto">
          Your delicious order has been placed successfully. Sit back and relax!
        </p>

        {/* Order details card */}
        <div className="bg-bg-secondary border border-border rounded-xl p-5 mb-5 text-left space-y-3 max-w-sm mx-auto">
          {details.map((d) => (
            <div key={d.label} className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">{d.label}</span>
              <span className={`font-bold text-text-primary ${d.mono ? 'font-mono' : ''}`}>
                {d.value}
              </span>
            </div>
          ))}
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> Est. Delivery
            </span>
            <span className="font-bold text-[#FF6B00]">{meta.deliveryTime}</span>
          </div>
        </div>

        {/* Status timeline */}
        <div className="flex items-center justify-center gap-0 mb-8 max-w-xs mx-auto">
          {[
            { icon: Package, label: 'Confirmed' },
            { icon: '🍳', label: 'Preparing', isEmoji: true },
            { icon: '🛵', label: 'On the way', isEmoji: true },
            { icon: CheckCircle, label: 'Delivered' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                    i === 0
                      ? 'bg-[#FF6B00] text-white shadow-[0_2px_12px_rgba(255,107,0,0.3)]'
                      : 'bg-bg-secondary border border-border text-text-muted'
                  }`}
                >
                  {typeof step.icon === 'string' ? (
                    step.icon
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] text-text-muted text-center leading-tight w-12">
                  {step.label}
                </span>
              </div>
              {i < 3 && (
                <div
                  className={`flex-1 h-0.5 mb-4 ${i === 0 ? 'bg-[#FF6B00]' : 'bg-border'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-all shadow-[0_4px_20px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_28px_rgba(255,107,0,0.4)] active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          Continue Shopping
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────
export default function CheckoutPage() {
  const { subtotal, discount, deliveryCharge, total, state } = useCart();
  const [step, setStep] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [successMeta, setSuccessMeta] = useState<SuccessMeta | null>(null);

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16">
      <div className="container max-w-5xl">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-text-primary">Checkout</h1>
          <p className="text-text-secondary text-sm mt-1">Complete your order in just a few steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step > s.id
                      ? 'bg-[#FF6B00] text-white'
                      : step === s.id
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_0_4px_rgba(255,107,0,0.2)]'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                  }`}
                >
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <span
                  className={`hidden sm:block text-sm font-semibold transition-colors ${
                    step >= s.id ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-all duration-500 ${
                    step > s.id ? 'bg-[#FF6B00]' : 'bg-border'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AddressStep
                    onNext={(address: Address) => {
                      setDeliveryAddress(address);
                      setStep(2);
                    }}
                  />
                </motion.div>
              )}

              {step === 2 && deliveryAddress && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentStep
                    deliveryAddress={deliveryAddress}
                    onBack={() => setStep(1)}
                    onSuccess={(oid: string, meta: SuccessMeta) => {
                      setOrderId(oid);
                      setSuccessMeta(meta);
                      setStep(3);
                    }}
                  />
                </motion.div>
              )}

              {step === 3 && orderId && successMeta && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OrderSuccessPanel orderId={orderId} meta={successMeta} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="bg-bg-card rounded-2xl p-6 shadow-card border border-border h-fit sticky top-24">
            <h3 className="font-serif font-bold text-lg mb-5 text-text-primary">Order Summary</h3>
            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-text-primary">{item.name}</p>
                    {item.selected_options.length > 0 && (
                      <p className="text-xs text-text-muted">
                        {item.selected_options.map((o) => o.value).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary">× {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {state.items.length === 0 && step === 3 && (
                <p className="text-xs text-text-muted text-center py-4">Cart cleared after order ✓</p>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2.5">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Delivery Fee</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              {state.tip > 0 && (
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Tip</span>
                  <span>{formatPrice(state.tip)}</span>
                </div>
              )}
              <div className="h-px bg-border" />
              <div className="flex justify-between font-bold text-base">
                <span className="text-text-primary">Total</span>
                <span className="text-[#FF6B00]">{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

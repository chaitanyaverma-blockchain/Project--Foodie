'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  ShoppingBag,
  Wallet,
  ArrowLeft,
  CheckCircle,
  Shield,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import {
  generateOrderId,
  generateTransactionId,
  generateDeliveryTime,
  saveOrderToLocalStorage,
} from '@/lib/fakePayment';
import type { Address } from '@/types';
import type { PaymentMethodLabel, FakeOrder } from '@/lib/fakePayment';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────

interface PaymentStepProps {
  deliveryAddress: Address;
  onBack: () => void;
  onSuccess: (orderId: string, meta: SuccessMeta) => void;
}

export interface SuccessMeta {
  transactionId: string | null;
  paymentMethod: PaymentMethodLabel;
  deliveryTime: string;
}

type PaymentTab = 'card' | 'upi' | 'cod' | 'wallet';

interface CardForm {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface CardErrors {
  number?: string;
  name?: string;
  expiry?: string;
  cvv?: string;
}

type WalletOption = { id: string; label: PaymentMethodLabel; color: string; icon: string };

const WALLET_OPTIONS: WalletOption[] = [
  { id: 'foodie', label: 'Foodie Wallet', color: '#FF6B00', icon: '🍽️' },
  { id: 'paytm', label: 'Paytm', color: '#002970', icon: '💳' },
  { id: 'phonepe', label: 'PhonePe', color: '#5f259f', icon: '📱' },
  { id: 'amazon', label: 'Amazon Pay', color: '#FF9900', icon: '📦' },
];

// ─── Helpers ─────────────────────────────────────────────────

function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .substring(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').substring(0, 4);
  if (digits.length >= 3) return `${digits.substring(0, 2)}/${digits.substring(2)}`;
  return digits;
}

function validateCard(form: CardForm): CardErrors {
  const errors: CardErrors = {};
  const digits = form.number.replace(/\s/g, '');
  if (!digits || digits.length < 16) errors.number = 'Enter a valid 16-digit card number';
  if (!form.name.trim()) errors.name = 'Cardholder name is required';
  const expiryParts = form.expiry.split('/');
  if (
    form.expiry.length < 5 ||
    expiryParts.length !== 2 ||
    parseInt(expiryParts[0]) < 1 ||
    parseInt(expiryParts[0]) > 12
  ) {
    errors.expiry = 'Enter a valid expiry date (MM/YY)';
  }
  if (!form.cvv || form.cvv.length < 3) errors.cvv = 'Enter a valid 3-digit CVV';
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────

function ProcessingOverlay({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 gap-5"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-orange-100 dark:border-orange-900 border-t-[#FF6B00] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-[#FF6B00]" />
        </div>
      </div>
      <p className="text-base font-semibold text-text-primary">{message}</p>
      <div className="flex gap-1.5">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#FF6B00]"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.8, repeat: Infinity, delay }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function InlineSuccess({
  orderId,
  transactionId,
  paymentMethod,
  deliveryTime,
  onContinue,
}: {
  orderId: string;
  transactionId: string | null;
  paymentMethod: string;
  deliveryTime: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center py-8 gap-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.15, stiffness: 250 }}
        className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
      </motion.div>

      <div className="text-center">
        <p className="font-serif text-2xl font-bold text-text-primary mb-1">Payment Successful!</p>
        <p className="text-text-secondary text-sm">Your order has been placed 🎉</p>
      </div>

      <div className="w-full bg-bg-secondary border border-border rounded-xl p-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Order ID</span>
          <span className="font-bold text-text-primary font-mono">{orderId}</span>
        </div>
        {transactionId && (
          <div className="flex justify-between">
            <span className="text-text-secondary">Transaction ID</span>
            <span className="font-mono text-text-primary">{transactionId}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-secondary">Payment via</span>
          <span className="font-semibold text-text-primary">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Est. Delivery
          </span>
          <span className="font-semibold text-[#FF6B00]">{deliveryTime}</span>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-4 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-colors shadow-[0_4px_20px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2"
      >
        View Order Details <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// ─── Fake QR Code (SVG) ───────────────────────────────────────

function FakeQRCode() {
  // A static decorative QR-like pattern — purely visual, not scannable
  const cells: boolean[][] = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0,0,0,0],
    [1,1,0,1,1,0,1,1,0,0,1,0,1,1,1,0,1,1,0,1,1],
    [0,1,0,1,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0],
    [0,1,1,0,0,1,0,1,0,0,1,1,0,1,0,0,1,0,0,1,1],
    [1,0,0,1,1,0,1,1,1,0,0,0,1,0,1,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,0,1,0,1,0,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,0,1,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,0,0,1],
    [1,0,1,1,1,0,1,1,0,0,0,1,1,0,0,1,0,0,1,1,0],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,1,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,0],
  ].map(row => row.map(v => v === 1));

  return (
    <div className="inline-block p-3 bg-white rounded-xl shadow-inner border border-gray-100">
      <svg
        width="168"
        height="168"
        viewBox="0 0 21 21"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {cells.map((row, y) =>
          row.map((filled, x) =>
            filled ? (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#1A1A1A" />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────

function CardPanel({
  total,
  onPay,
}: {
  total: number;
  onPay: (method: PaymentMethodLabel) => void;
}) {
  const [form, setForm] = useState<CardForm>({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState<CardErrors>({});
  const [showCvv, setShowCvv] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    const errs = validateCard(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setErrors({});
    onPay('Credit / Debit Card');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Card preview strip */}
      <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FF6B00] via-[#FF8C38] to-[#c94e00] p-5 shadow-[0_8px_32px_rgba(255,107,0,0.35)]">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <CreditCard className="w-8 h-8 text-white/80" />
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">Demo Card</span>
          </div>
          <div>
            <p className="text-white font-mono text-lg tracking-widest mb-1">
              {form.number || '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between text-white/80 text-xs">
              <span>{form.name || 'CARD HOLDER'}</span>
              <span>{form.expiry || 'MM/YY'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <motion.div animate={shake ? { x: [0, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.5 }}>
        {/* Card Number */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
            Card Number
          </label>
          <input
            id="card-number-input"
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={form.number}
            onChange={(e) =>
              setForm((p) => ({ ...p, number: formatCardNumber(e.target.value) }))
            }
            maxLength={19}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-bg-input dark:bg-[#18181B] text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] font-mono text-sm transition-all outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.25)] ${
              errors.number ? 'border-red-500' : 'border-border dark:border-[#353B46]'
            }`}
          />
          {errors.number && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.number}
            </p>
          )}
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
            Cardholder Name
          </label>
          <input
            id="card-name-input"
            type="text"
            placeholder="John Smith"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-bg-input dark:bg-[#18181B] text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] font-mono text-sm transition-all outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.25)] ${
              errors.name ? 'border-red-500' : 'border-border dark:border-[#353B46]'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              Expiry Date
            </label>
            <input
              id="card-expiry-input"
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={form.expiry}
              onChange={(e) => setForm((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
              maxLength={5}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-bg-input dark:bg-[#18181B] text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] font-mono text-sm transition-all outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.25)] ${
                errors.expiry ? 'border-red-500' : 'border-border dark:border-[#353B46]'
              }`}
            />
            {errors.expiry && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.expiry}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              CVV
            </label>
            <div className="relative">
              <input
                id="card-cvv-input"
                type={showCvv ? 'text' : 'password'}
                inputMode="numeric"
                placeholder="•••"
                value={form.cvv}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) }))
                }
                maxLength={3}
                className={`w-full px-4 py-3 pr-10 rounded-xl border-2 bg-bg-input dark:bg-[#18181B] text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] font-mono text-sm transition-all outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.25)] ${
                  errors.cvv ? 'border-red-500' : 'border-border dark:border-[#353B46]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCvv((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.cvv && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.cvv}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <button
        id="card-pay-btn"
        onClick={handleSubmit}
        className="w-full py-4 mt-2 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_28px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2 text-base"
      >
        <Shield className="w-4 h-4" />
        Pay {formatPrice(total)} Securely
      </button>
    </motion.div>
  );
}

function UpiPanel({ onPay }: { onPay: (method: PaymentMethodLabel) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-5 py-2"
    >
      <div className="text-center">
        <p className="text-text-secondary text-sm mb-1">Scan the QR code using any UPI app</p>
        <p className="text-xs text-text-muted">or pay using the UPI ID below</p>
      </div>

      <FakeQRCode />

      <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-border rounded-xl">
        <Smartphone className="w-4 h-4 text-[#FF6B00]" />
        <span className="font-mono font-semibold text-text-primary text-sm tracking-wide">foodie@upi</span>
      </div>

      <div className="w-full flex items-center gap-3 text-text-muted text-xs">
        <div className="flex-1 h-px bg-border" />
        <span>Supported apps</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex items-center gap-4 text-2xl">
        <span title="Google Pay">🅖</span>
        <span title="PhonePe">📱</span>
        <span title="Paytm">💳</span>
        <span title="BHIM">🏦</span>
      </div>

      <button
        id="upi-paid-btn"
        onClick={() => onPay('UPI')}
        className="w-full py-4 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2 text-base"
      >
        <CheckCircle className="w-5 h-5" />
        I Have Paid
      </button>
    </motion.div>
  );
}

function CodPanel({ onPay }: { onPay: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-5 py-4"
    >
      <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-4xl">
        🚚
      </div>
      <div className="text-center">
        <p className="font-serif font-bold text-xl text-text-primary mb-2">Cash on Delivery</p>
        <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
          Pay cash when your order arrives at your doorstep. Our delivery partner will carry change.
        </p>
      </div>

      <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-0.5">Keep exact change ready</p>
            <p className="text-amber-700 dark:text-amber-500 text-xs">
              Please keep the exact amount ready to make the process smooth for everyone.
            </p>
          </div>
        </div>
      </div>

      <button
        id="cod-place-order-btn"
        onClick={onPay}
        className="w-full py-4 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2 text-base"
      >
        <ShoppingBag className="w-5 h-5" />
        Place Order
      </button>
    </motion.div>
  );
}

function WalletPanel({ onPay }: { onPay: (method: PaymentMethodLabel) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <p className="text-sm text-text-secondary mb-2">Select your wallet</p>
      {WALLET_OPTIONS.map((w) => (
        <button
          key={w.id}
          id={`wallet-${w.id}-btn`}
          onClick={() => setSelected(w.id)}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
            selected === w.id
              ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-900/20 shadow-[0_0_0_3px_rgba(255,107,0,0.12)]'
              : 'border-border dark:border-[#353B46] hover:border-gray-300 dark:hover:border-zinc-600 bg-bg-input dark:bg-[#18181B]'
          }`}
        >
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${w.color}15` }}
          >
            {w.icon}
          </span>
          <span className="font-semibold text-text-primary text-sm">{w.label}</span>
          <div
            className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected === w.id ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-border'
            }`}
          >
            {selected === w.id && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </button>
      ))}

      <button
        id="wallet-pay-btn"
        disabled={!selected}
        onClick={() => {
          const opt = WALLET_OPTIONS.find((w) => w.id === selected);
          if (opt) onPay(opt.label);
        }}
        className="w-full py-4 mt-2 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,107,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 text-base"
      >
        <Wallet className="w-5 h-5" />
        Pay with Wallet
      </button>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function PaymentStep({ deliveryAddress, onBack, onSuccess }: PaymentStepProps) {
  const { state, total, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState<PaymentTab>('card');
  const [phase, setPhase] = useState<'idle' | 'processing' | 'success'>('idle');
  const [processingMessage, setProcessingMessage] = useState('Processing Payment...');
  const [successData, setSuccessData] = useState<{
    orderId: string;
    transactionId: string | null;
    paymentMethod: PaymentMethodLabel;
    deliveryTime: string;
  } | null>(null);

  const TABS: { id: PaymentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'cod', label: 'Cash', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
  ];

  const simulate = async (
    paymentMethod: PaymentMethodLabel,
    isCOD = false
  ) => {
    const orderId = generateOrderId();
    const transactionId = isCOD ? null : generateTransactionId();
    const deliveryTime = generateDeliveryTime();

    if (!isCOD) {
      setProcessingMessage(
        paymentMethod === 'UPI' ? 'Verifying Payment...' : 'Processing Payment...'
      );
      setPhase('processing');
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Build and persist fake order
    const order: FakeOrder = {
      orderId,
      transactionId,
      paymentMethod,
      amount: total,
      items: state.items,
      deliveryAddress: {
        full_name: deliveryAddress.full_name,
        phone: deliveryAddress.phone,
        line1: deliveryAddress.line1,
        line2: deliveryAddress.line2,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
      },
      deliveryTime,
      createdAt: new Date().toISOString(),
    };
    saveOrderToLocalStorage(order);
    clearCart();

    setSuccessData({ orderId, transactionId, paymentMethod, deliveryTime });
    setPhase('success');
    toast.success('Order placed successfully! 🎉');
  };

  const handleContinue = () => {
    if (successData) {
      onSuccess(successData.orderId, {
        transactionId: successData.transactionId,
        paymentMethod: successData.paymentMethod,
        deliveryTime: successData.deliveryTime,
      });
    }
  };

  return (
    <div className="bg-bg-card rounded-2xl p-6 shadow-card border border-border">
      {/* Back button — hidden during processing/success */}
      {phase === 'idle' && (
        <button
          id="back-to-address-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-semibold mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Change Address
        </button>
      )}

      {/* Delivery address chip */}
      {phase === 'idle' && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/40 rounded-xl p-3.5 mb-5">
          <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-wide mb-0.5">Delivering to</p>
          <p className="text-sm font-semibold text-text-primary">
            {deliveryAddress.full_name} · {deliveryAddress.phone}
          </p>
          <p className="text-sm text-text-secondary">
            {deliveryAddress.line1}
            {deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ''}, {deliveryAddress.city},{' '}
            {deliveryAddress.state} – {deliveryAddress.pincode}
          </p>
        </div>
      )}

      {/* Demo disclaimer */}
      {phase === 'idle' && (
        <div className="flex items-start gap-2 mb-5 px-3 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-lg">
          <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            <span className="font-bold">Demo Project</span> – Payments are simulated. No real transactions are processed.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'processing' && (
          <ProcessingOverlay key="processing" message={processingMessage} />
        )}

        {phase === 'success' && successData && (
          <InlineSuccess
            key="success"
            orderId={successData.orderId}
            transactionId={successData.transactionId}
            paymentMethod={successData.paymentMethod}
            deliveryTime={successData.deliveryTime}
            onContinue={handleContinue}
          />
        )}

        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="font-serif font-bold text-xl mb-5 text-text-primary">Choose Payment Method</h2>

            {/* Tab bar */}
            <div className="grid grid-cols-4 gap-2 mb-6 p-1.5 bg-bg-secondary rounded-xl border border-border">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`payment-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#FF6B00] text-white shadow-[0_2px_12px_rgba(255,107,0,0.3)]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'card' && (
                <CardPanel key="card" total={total} onPay={(m) => simulate(m)} />
              )}
              {activeTab === 'upi' && (
                <UpiPanel key="upi" onPay={(m) => simulate(m)} />
              )}
              {activeTab === 'cod' && (
                <CodPanel key="cod" onPay={() => simulate('Cash on Delivery', true)} />
              )}
              {activeTab === 'wallet' && (
                <WalletPanel key="wallet" onPay={(m) => simulate(m)} />
              )}
            </AnimatePresence>

            {/* Security badge */}
            <div className="flex items-center gap-2 mt-5 text-xs text-text-muted">
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Your information is safe. This is a demo — no data leaves your browser.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

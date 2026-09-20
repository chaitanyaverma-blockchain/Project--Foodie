// ============================================================
// FOODIE — Fake Payment Utilities
// Demo project only. No real transactions are processed.
// ============================================================

import type { CartItem } from '@/types';

// ─── Types ──────────────────────────────────────────────────

export type PaymentMethodLabel =
  | 'Credit / Debit Card'
  | 'UPI'
  | 'Cash on Delivery'
  | 'Foodie Wallet'
  | 'Paytm'
  | 'PhonePe'
  | 'Amazon Pay';

export interface FakeOrder {
  orderId: string;
  transactionId: string | null; // null for COD
  paymentMethod: PaymentMethodLabel;
  amount: number;
  items: CartItem[];
  deliveryAddress: {
    full_name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryTime: string;
  createdAt: string;
}

// ─── ID generators ──────────────────────────────────────────

/** Generates a fake Order ID like "FD-38471" */
export function generateOrderId(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `FD-${digits}`;
}

/** Generates a fake Transaction ID like "TXN-94837291" */
export function generateTransactionId(): string {
  const digits = Math.floor(10000000 + Math.random() * 90000000);
  return `TXN-${digits}`;
}

/** Generates a delivery window string like "25–35 mins" */
export function generateDeliveryTime(): string {
  const base = Math.floor(20 + Math.random() * 15); // 20–34
  const end = base + Math.floor(10 + Math.random() * 11); // +10–20
  return `${base}–${end} mins`;
}

// ─── LocalStorage helpers ────────────────────────────────────

const STORAGE_KEY = 'foodie-orders';

/** Saves a fake order to localStorage. */
export function saveOrderToLocalStorage(order: FakeOrder): void {
  try {
    const existing = getOrdersFromLocalStorage();
    existing.unshift(order); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // ignore quota errors in SSR / private mode
  }
}

/** Reads all fake orders from localStorage. */
export function getOrdersFromLocalStorage(): FakeOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FakeOrder[];
  } catch {
    return [];
  }
}

/** Reads a single fake order by orderId. */
export function getOrderById(orderId: string): FakeOrder | null {
  return getOrdersFromLocalStorage().find((o) => o.orderId === orderId) ?? null;
}

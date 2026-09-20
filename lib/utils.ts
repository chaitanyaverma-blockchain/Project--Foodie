import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in INR
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate a short order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `FD-${timestamp}-${random}`;
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '…';
}

// Slugify a string
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Calculate discounted price
export function getEffectivePrice(price: number, salePrice: number | null): number {
  return salePrice ?? price;
}

// Calculate discount percentage
export function getDiscountPercent(price: number, salePrice: number | null): number | null {
  if (!salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

// Format time ago
export function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Generate unique cart item ID based on food item + options
export function generateCartItemId(foodItemId: string, selectedOptionValueIds: string[]): string {
  const sorted = [...selectedOptionValueIds].sort().join('-');
  return `${foodItemId}::${sorted}`;
}

// Apply coupon to subtotal
export function applyCouponDiscount(
  subtotal: number,
  couponType: 'percentage' | 'fixed',
  couponValue: number,
  maxDiscount: number | null
): number {
  let discount = 0;
  if (couponType === 'percentage') {
    discount = (subtotal * couponValue) / 100;
  } else {
    discount = couponValue;
  }
  if (maxDiscount !== null) {
    discount = Math.min(discount, maxDiscount);
  }
  return Math.min(discount, subtotal);
}

// Fulfillment status to label
export const STATUS_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed',
  preparing: 'Kitchen Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<string, string> = {
  placed: 'text-blue-600',
  confirmed: 'text-indigo-600',
  preparing: 'text-yellow-600',
  out_for_delivery: 'text-orange-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-600',
};

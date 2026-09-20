'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { CartItem, CartState, Coupon, SelectedOption } from '@/types';
import { generateCartItemId, applyCouponDiscount } from '@/lib/utils';

// ============================================================
// CART ACTIONS
// ============================================================
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_COUPON'; payload: Coupon | null }
  | { type: 'SET_TIP'; payload: number }
  | { type: 'LOAD_STATE'; payload: CartState };

// ============================================================
// CART REDUCER
// ============================================================
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItemId = generateCartItemId(
        action.payload.food_item_id,
        action.payload.selected_options.map((o) => o.value_id)
      );
      const existing = state.items.find((i) => i.id === newItemId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === newItemId
              ? { ...i, quantity: i.quantity + (action.payload.quantity ?? 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, id: newItemId, quantity: action.payload.quantity ?? 1 },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [], coupon: null, tip: 0 };
    case 'SET_COUPON':
      return { ...state, coupon: action.payload };
    case 'SET_TIP':
      return { ...state, tip: action.payload };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

// ============================================================
// CART CONTEXT
// ============================================================
interface CartContextValue {
  state: CartState;
  // Derived values
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (coupon: Coupon | null) => void;
  setTip: (tip: number) => void;
  isInCart: (foodItemId: string) => boolean;
  getItemQuantity: (foodItemId: string) => number;
  // Flying animation
  triggerFlyAnimation: (sourceEl: HTMLElement, foodItemId: string) => void;
  cartIconRef: React.RefObject<HTMLDivElement | null>;
}

const CartContext = createContext<CartContextValue | null>(null);

const INITIAL_STATE: CartState = { items: [], coupon: null, tip: 0 };
const DELIVERY_CHARGE = 40;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE);
  const cartIconRef = useRef<HTMLDivElement | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('foodie-cart');
      if (stored) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('foodie-cart', JSON.stringify(state));
  }, [state]);

  // Derived values
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = state.coupon
    ? applyCouponDiscount(subtotal, state.coupon.type, state.coupon.value, state.coupon.max_discount ?? null)
    : 0;
  const deliveryCharge = itemCount === 0 ? 0 : DELIVERY_CHARGE;
  const total = Math.max(0, subtotal - discount + deliveryCharge + state.tip);

  const addItem = useCallback(
    (item: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) => {
      dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity } });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setCoupon = useCallback((coupon: Coupon | null) => {
    dispatch({ type: 'SET_COUPON', payload: coupon });
  }, []);

  const setTip = useCallback((tip: number) => {
    dispatch({ type: 'SET_TIP', payload: tip });
  }, []);

  const isInCart = useCallback(
    (foodItemId: string) => state.items.some((i) => i.food_item_id === foodItemId),
    [state.items]
  );

  const getItemQuantity = useCallback(
    (foodItemId: string) =>
      state.items
        .filter((i) => i.food_item_id === foodItemId)
        .reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const triggerFlyAnimation = useCallback(
    (sourceEl: HTMLElement, _foodItemId: string) => {
      const cartIcon = cartIconRef.current;
      if (!cartIcon) return;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = cartIcon.getBoundingClientRect();

      // Create ghost element
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position: fixed;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #FF6B00;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        pointer-events: none;
        z-index: 9999;
        left: ${sourceRect.left + sourceRect.width / 2 - 24}px;
        top: ${sourceRect.top + sourceRect.height / 2 - 24}px;
        transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        opacity: 1;
      `;
      ghost.textContent = '🍽️';
      document.body.appendChild(ghost);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ghost.style.left = `${targetRect.left + targetRect.width / 2 - 24}px`;
          ghost.style.top = `${targetRect.top + targetRect.height / 2 - 24}px`;
          ghost.style.transform = 'scale(0.3)';
          ghost.style.opacity = '0';
        });
      });

      setTimeout(() => {
        document.body.removeChild(ghost);
        // Bounce the cart icon
        cartIcon.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.3)' },
            { transform: 'scale(1)' },
          ],
          { duration: 400, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' }
        );
      }, 700);
    },
    []
  );

  return (
    <CartContext.Provider
      value={{
        state,
        itemCount,
        subtotal,
        discount,
        deliveryCharge,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setCoupon,
        setTip,
        isInCart,
        getItemQuantity,
        triggerFlyAnimation,
        cartIconRef,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

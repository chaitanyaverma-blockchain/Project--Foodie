'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { FoodDrawerProvider } from '@/context/FoodDrawerContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavouritesProvider>
        <CartProvider>
          <FoodDrawerProvider>
            {children}
          </FoodDrawerProvider>
        </CartProvider>
      </FavouritesProvider>
    </AuthProvider>
  );
}

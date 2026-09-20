'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FavouritesContextValue {
  favourites: string[];
  favorites: string[]; // alias
  favoriteCount: number;
  toggleFavourite: (id: string) => void;
  toggleFavorite: (id: string) => void; // alias
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavourite: (id: string) => boolean;
  isFavorite: (id: string) => boolean; // alias
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('foodie-favourites');
      if (stored) {
        setFavourites(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id];
      try {
        localStorage.setItem('foodie-favourites', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const addFavorite = useCallback((id: string) => {
    setFavourites((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem('foodie-favourites', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavourites((prev) => {
      if (!prev.includes(id)) return prev;
      const next = prev.filter(fid => fid !== id);
      try { localStorage.setItem('foodie-favourites', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (id: string) => {
      if (!mounted) return false;
      return favourites.includes(id);
    },
    [favourites, mounted]
  );

  return (
    <FavouritesContext.Provider value={{
      favourites,
      favorites: favourites,
      favoriteCount: favourites.length,
      toggleFavourite,
      toggleFavorite: toggleFavourite,
      addFavorite,
      removeFavorite,
      isFavourite,
      isFavorite: isFavourite
    }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}

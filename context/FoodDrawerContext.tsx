'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { FoodItem } from '@/types';
import { FoodDetailDrawer } from '@/components/menu/FoodDetailDrawer';

interface FoodDrawerContextValue {
  openDrawer: (item: FoodItem) => void;
  closeDrawer: () => void;
  allItems: FoodItem[]; // We need to store all items here to pass to the drawer for "Similar Dishes"
  setAllItems: (items: FoodItem[]) => void;
}

const FoodDrawerContext = createContext<FoodDrawerContextValue | null>(null);

export function FoodDrawerProvider({ children }: { children: React.ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [allItems, setAllItems] = useState<FoodItem[]>([]);

  const openDrawer = useCallback((item: FoodItem) => {
    setSelectedItem(item);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <FoodDrawerContext.Provider value={{ openDrawer, closeDrawer, allItems, setAllItems }}>
      {children}
      {selectedItem && (
        <FoodDetailDrawer
          item={selectedItem}
          allItems={allItems}
          onClose={closeDrawer}
        />
      )}
    </FoodDrawerContext.Provider>
  );
}

export function useFoodDrawer() {
  const ctx = useContext(FoodDrawerContext);
  if (!ctx) throw new Error('useFoodDrawer must be used within FoodDrawerProvider');
  return ctx;
}

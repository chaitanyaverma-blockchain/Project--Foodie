'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShoppingCart, Frown } from 'lucide-react';
import { FoodItem } from '@/types';
import Link from 'next/link';

interface OrderItModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodItem: FoodItem | null;
  recipeTitle: string;
}

export function OrderItModal({ open, onOpenChange, foodItem, recipeTitle }: OrderItModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden outline-none border border-gray-100 dark:border-[#2A2A2A] text-center"
              >
                {foodItem ? (
                  <>
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingCart className="w-10 h-10 text-green-500" />
                    </div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-serif">
                      Great News!
                    </Dialog.Title>
                    <Dialog.Description className="text-gray-600 dark:text-gray-300 mb-8">
                      We found <strong>{foodItem.name}</strong> on Foodies. You can order it right now, fresh and hot!
                    </Dialog.Description>
                    
                    <Link
                      href="/menu"
                      onClick={() => onOpenChange(false)}
                      className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#FF6B00] text-white rounded-xl font-bold text-lg hover:bg-[#E56000] transition-colors shadow-orange"
                    >
                      Order from Menu
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Frown className="w-10 h-10 text-gray-400" />
                    </div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-serif">
                      Currently Unavailable
                    </Dialog.Title>
                    <Dialog.Description className="text-gray-600 dark:text-gray-300 mb-8">
                      This dish is currently unavailable for ordering directly from our restaurants. But you can always click "Cook It" to get the ingredients!
                    </Dialog.Description>
                    
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </>
                )}

                <Dialog.Close asChild>
                  <button className="absolute right-6 top-6 rounded-full p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

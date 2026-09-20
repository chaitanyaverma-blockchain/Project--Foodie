'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShoppingBag } from 'lucide-react';

interface CookItModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeTitle: string;
}

const platforms = [
  {
    name: 'Blinkit',
    url: 'https://blinkit.com',
    color: 'bg-[#F8CB46]',
    iconColor: 'text-[#1a1a1a]',
  },
  {
    name: 'Swiggy Instamart',
    url: 'https://www.swiggy.com/instamart',
    color: 'bg-[#FC8019]',
    iconColor: 'text-white',
  },
  {
    name: 'Flipkart Minutes',
    url: 'https://www.flipkart.com',
    color: 'bg-[#2874F0]',
    iconColor: 'text-white',
  },
  {
    name: 'BigBasket',
    url: 'https://www.bigbasket.com',
    color: 'bg-[#84C225]',
    iconColor: 'text-white',
  },
];

export function CookItModal({ open, onOpenChange, recipeTitle }: CookItModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            {/* Modal Panel */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 outline-none"
              >
                <div className="relative bg-white dark:bg-[#1C1C1C] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">

                  {/* Close button — pinned to top-right of container */}
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close"
                      className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </Dialog.Close>

                  {/* Header */}
                  <div className="px-6 pt-6 pb-4 pr-14">
                    <Dialog.Title className="text-xl font-semibold leading-snug text-gray-900 dark:text-white tracking-tight">
                      Get Ingredients for{' '}
                      <span className="text-[#FF6B00]">{recipeTitle}</span>
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      Foodie does not sell groceries. Order your ingredients from your favourite platform in minutes.
                    </Dialog.Description>
                  </div>

                  {/* Divider */}
                  <div className="mx-6 h-px bg-gray-100 dark:bg-[#2A2A2A]" />

                  {/* Platform Grid */}
                  <div className="p-6 grid grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-100 dark:border-[#2A2A2A] hover:border-[#FF6B00]/40 hover:bg-orange-50 dark:hover:bg-[#FF6B00]/5 transition-all duration-200"
                      >
                        {/* Icon circle */}
                        <div
                          className={`w-12 h-12 ${platform.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}
                        >
                          <ShoppingBag className={`w-5 h-5 ${platform.iconColor}`} />
                        </div>

                        {/* Platform name */}
                        <span className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 leading-tight">
                          {platform.name}
                        </span>

                        {/* External link indicator */}
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-[#FF6B00] transition-colors duration-200" />
                      </a>
                    ))}
                  </div>

                  {/* Footer note */}
                  <p className="px-6 pb-5 text-center text-xs text-gray-400 dark:text-gray-600">
                    You'll be redirected to the platform's website.
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

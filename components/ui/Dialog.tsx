'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({ open, onClose, children, className, size = 'md' }: DialogProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Dialog Panel */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-h-[85vh]',
              sizes[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface DialogHeaderProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export function DialogHeader({ title, onClose, children }: DialogHeaderProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-white z-10">
      <h2 className="font-serif text-xl font-bold text-gray-900">{title}</h2>
      <div className="flex items-center gap-2">
        {children}
        <button
          id="dialog-close-btn"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export function DialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex-1 p-5 sm:p-6 overflow-y-auto', className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 p-5 sm:p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 z-10">
      {children}
    </div>
  );
}

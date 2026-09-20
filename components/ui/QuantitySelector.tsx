'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  min = 0,
  max = 99,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const sizes = {
    sm: { btn: 'w-7 h-7', text: 'text-sm w-7', icon: 14 },
    md: { btn: 'w-9 h-9', text: 'text-base w-9', icon: 16 },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-1 bg-orange-50 rounded-full p-0.5', className)}>
      <motion.button
        id={`qty-decrease-${quantity}`}
        whileTap={{ scale: 0.85 }}
        onClick={onDecrease}
        disabled={quantity <= min}
        className={cn(
          s.btn,
          'flex items-center justify-center rounded-full bg-white text-[#FF6B00] border border-orange-200',
          'hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition-all duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#FF6B00]'
        )}
      >
        <Minus size={s.icon} strokeWidth={2.5} />
      </motion.button>

      <motion.span
        key={quantity}
        initial={{ scale: 1.3, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={cn(s.text, 'text-center font-bold text-[#1A1A1A] tabular-nums')}
      >
        {quantity}
      </motion.span>

      <motion.button
        id={`qty-increase-${quantity}`}
        whileTap={{ scale: 0.85 }}
        onClick={onIncrease}
        disabled={quantity >= max}
        className={cn(
          s.btn,
          'flex items-center justify-center rounded-full bg-[#FF6B00] text-white',
          'hover:bg-[#E56000] transition-all duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        <Plus size={s.icon} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  const radii = {
    sm: 'rounded',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn('shimmer', radii[rounded], className)}
      style={{ width, height }}
    />
  );
}

// Card Skeleton preset
export function FoodCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card p-0">
      <Skeleton className="w-full h-48" rounded="sm" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28" rounded="full" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      <Skeleton className="w-16 h-16" rounded="full" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-4 shadow-card">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
}

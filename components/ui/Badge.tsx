import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  type: 'veg' | 'non-veg' | 'egg' | 'drink';
  className?: string;
}

const VEG_ICON = (
  <span className="inline-block w-3 h-3 border-2 border-green-600 flex items-center justify-center rounded-sm">
    <span className="block w-1.5 h-1.5 bg-green-600 rounded-full" />
  </span>
);

const NON_VEG_ICON = (
  <span className="inline-block w-3 h-3 border-2 border-red-600 flex items-center justify-center rounded-sm">
    <span className="block w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-red-600" />
  </span>
);

const EGG_ICON = (
  <span className="inline-block w-3 h-3 border-2 border-amber-600 flex items-center justify-center rounded-full">
    <span className="block w-1 h-1 bg-amber-600 rounded-full" />
  </span>
);

const DRINK_ICON = (
  <span className="inline-block w-3 h-3 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M4 10h16"/><path d="M5 10l1 10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-10"/><path d="M8 3l1 7"/><path d="M12 3v7"/><path d="M16 3l-1 7"/></svg>
  </span>
);

export function DietBadge({ type, className }: BadgeProps) {
  const styles = {
    veg: 'bg-green-50 text-green-700 border-green-600',
    'non-veg': 'bg-red-50 text-red-700 border-red-600',
    egg: 'bg-amber-50 text-amber-700 border-amber-600',
    drink: 'bg-blue-50 text-blue-700 border-blue-600',
  };

  const labels = {
    veg: 'Veg',
    'non-veg': 'Non-Veg',
    egg: 'Egg',
    drink: 'Drink',
  };

  const icons = {
    veg: VEG_ICON,
    'non-veg': NON_VEG_ICON,
    egg: EGG_ICON,
    drink: DRINK_ICON,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide',
        styles[type],
        className
      )}
    >
      {icons[type]}
      {labels[type]}
    </span>
  );
}

interface TagBadgeProps {
  label: string;
  className?: string;
}

export function TagBadge({ label, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700',
        className
      )}
    >
      {label}
    </span>
  );
}

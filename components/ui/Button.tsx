import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-[#FF6B00] text-white hover:bg-[#E56000] active:scale-95 shadow-[0_4px_20px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_28px_rgba(255,107,0,0.4)]',
    secondary:
      'bg-[#FFF4EE] text-[#FF6B00] hover:bg-orange-100 active:scale-95',
    ghost:
      'bg-transparent text-[#6B6B6B] hover:bg-gray-100 active:scale-95',
    outline:
      'bg-transparent border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white active:scale-95',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-[0_4px_20px_rgba(220,38,38,0.3)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2',
  };

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

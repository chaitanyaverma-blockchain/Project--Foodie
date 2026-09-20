'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        <div className="floating-input-wrapper group">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            className={cn(
              'floating-input',
              'focus:ring-2 focus:ring-orange-500 focus:border-transparent',
              icon && '!pl-11',
              suffix && '!pr-12',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          <label htmlFor={inputId} className={cn('floating-label', icon && 'has-icon')}>
            {label}
          </label>
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = 'FloatingInput';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        <div className="floating-input-wrapper">
          <textarea
            ref={ref}
            id={inputId}
            placeholder=" "
            rows={3}
            className={cn(
              'floating-input resize-none pt-5',
              'focus:ring-2 focus:ring-orange-500 focus:border-transparent',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          <label htmlFor={inputId} className="floating-label">
            {label}
          </label>
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);
FloatingTextarea.displayName = 'FloatingTextarea';

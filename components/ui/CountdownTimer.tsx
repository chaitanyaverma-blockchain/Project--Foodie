'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
  onExpire?: () => void;
  className?: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownTimer({ targetDate, onExpire, className }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft(targetDate));
    
    const interval = setInterval(() => {
      const t = getTimeLeft(targetDate);
      setTimeLeft(t);
      if (t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!mounted) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={`flex items-center gap-1.5 font-mono font-bold ${className}`}>
      <Clock className="w-4 h-4" />
      <span>{pad(timeLeft.hours)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(timeLeft.minutes)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(timeLeft.seconds)}</span>
    </div>
  );
}

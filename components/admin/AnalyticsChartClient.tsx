'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const RechartsModule = dynamic(() => import('recharts'), { ssr: false });

const PERIODS = [
  { key: '7d', label: '7 Days' },
  { key: '1m', label: '1 Month' },
  { key: '3m', label: '3 Months' },
  { key: '1y', label: '1 Year' },
] as const;
type Period = typeof PERIODS[number]['key'];

function generateRevenueData(period: Period) {
  const now = new Date();
  const data: { date: string; revenue: number }[] = [];
  const seed = (i: number, base: number, amp: number) => Math.round(base + Math.sin(i * 0.7) * amp + Math.random() * amp * 0.3);

  if (period === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      data.push({ date: d.toISOString().slice(0, 10), revenue: seed(i, 68000, 22000) });
    }
  } else if (period === '1m') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      data.push({ date: d.toISOString().slice(0, 10), revenue: seed(i, 65000, 30000) });
    }
  } else if (period === '3m') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      data.push({ date: d.toISOString().slice(0, 10), revenue: seed(i, 460000, 80000) });
    }
  } else if (period === '1y') {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now); d.setMonth(d.getMonth() - i);
      data.push({ date: months[d.getMonth()] + ' ' + d.getFullYear(), revenue: seed(i, 420000, 120000) });
    }
  }
  return data;
}

export function AnalyticsRevenueChart() {
  const [Recharts, setRecharts] = useState<typeof import('recharts') | null>(null);
  const [activePeriod, setActivePeriod] = useState<Period>('1m');
  const revenueData = useMemo(() => generateRevenueData(activePeriod), [activePeriod]);

  useEffect(() => { import('recharts').then(setRecharts); }, []);

  if (!Recharts) return <div className="flex items-center justify-center h-full text-gray-300 text-sm">Loading chart…</div>;

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

  const tickFormatter = (d: string) => {
    if (activePeriod === '1y' || activePeriod === '3m') return d;
    return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };
  
  const labelFormatter = (label: string) => {
    if (activePeriod === '1y' || activePeriod === '3m') return label;
    return new Date(label).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute -top-12 right-0 z-10 flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePeriod(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activePeriod === p.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="date" tickFormatter={tickFormatter} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
            labelFormatter={labelFormatter}
            cursor={{ stroke: '#FF6B00', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} fill="url(#analyticsGrad)" dot={false} activeDot={{ r: 5, fill: '#FF6B00', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp, ShoppingBag, IndianRupee,
  Clock, ArrowUpRight, ArrowRight, Bell, RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { DashboardStats } from '@/types';

// ─── Single dynamic import of entire recharts module (fixes SSR + "never" TS error)
const RechartsModule = dynamic(() => import('recharts'), { ssr: false });

// ─── Time-period filter config ────────────────────────────────────────────────
const PERIODS = [
  { key: '7d',  label: '7 Days' },
  { key: '1m',  label: '1 Month' },
  { key: '3m',  label: '3 Months' },
  { key: '1y',  label: '1 Year' },
] as const;
type Period = typeof PERIODS[number]['key'];

// ─── Generate demo revenue data for each period ───────────────────────────────
function generateRevenueData(period: Period) {
  const now = new Date();
  const data: { date: string; revenue: number }[] = [];

  const seed = (i: number, base: number, amp: number) =>
    Math.round(base + Math.sin(i * 0.7) * amp + Math.abs(Math.cos(i * 1.3)) * amp * 0.3);

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
      data.push({
        date: months[d.getMonth()] + ' ' + d.getFullYear(),
        revenue: seed(i, 420000, 120000),
      });
    }
  }
  return data;
}

// ─── Order status demo data ───────────────────────────────────────────────────
const DUMMY_STATUS = [
  { status: 'In Kitchen',       count: 28 },
  { status: 'Out for Delivery', count: 41 },
  { status: 'Driver Assigned',  count: 19 },
  { status: 'Delivered',        count: 152 },
];

const SPARKLINE_DATA = [12, 19, 15, 28, 24, 32, 35];
const DONUT_COLORS   = ['#FF6B00', '#F59E0B', '#3B82F6', '#16A34A'];

const STOCK_ALERTS = [
  { restaurant: 'Burger Junction', item: 'Sesame Buns',       level: 'critical', stock: '4 units left' },
  { restaurant: 'Pizza Palace',    item: 'Mozzarella Cheese', level: 'critical', stock: '1 kg left' },
  { restaurant: 'Spice Garden',    item: 'Basmati Rice',      level: 'low',      stock: '8 kg left' },
  { restaurant: 'Sandwich Hub',    item: 'Whole Wheat Bread', level: 'low',      stock: '12 units left' },
];

const LIVE_ORDERS = [
  { id: '#F-8821', restaurant: 'Burger Junction', customer: 'Rahul M.',  amount: 489, status: 'Preparing',        statusColor: 'amber' },
  { id: '#F-8820', restaurant: 'Pizza Palace',    customer: 'Sneha R.',  amount: 749, status: 'Out for Delivery',  statusColor: 'blue' },
  { id: '#F-8819', restaurant: 'Spice Garden',    customer: 'Arjun K.',  amount: 328, status: 'Delivered',         statusColor: 'green' },
  { id: '#F-8818', restaurant: 'Sandwich Hub',    customer: 'Priya T.',  amount: 215, status: 'Preparing',        statusColor: 'amber' },
  { id: '#F-8817', restaurant: 'Sushi Bar',       customer: 'Vikram S.', amount: 920, status: 'Delivered',         statusColor: 'green' },
  { id: '#F-8816', restaurant: 'Burger Junction', customer: 'Ananya D.', amount: 385, status: 'Driver Assigned',  statusColor: 'purple' },
];

const STATUS_PILL: Record<string, string> = {
  green:  'bg-green-50  text-green-700  border border-green-200',
  amber:  'bg-amber-50  text-amber-700  border border-amber-200',
  blue:   'bg-blue-50   text-blue-700   border border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
};

// ─── Mini SVG Sparkline ───────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const H = 36, W = 80;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`);
  const line = `M ${pts.join(' L ')}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color.replace('#','')})`} />
      <path d={line}  fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Real-time Clock ──────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm font-semibold text-gray-700">{time}</span>;
}

// ─── Revenue Chart (uses the full recharts module) ────────────────────────────
function RevenueChart({ data, period }: { data: { date: string; revenue: number }[]; period: Period }) {
  const [Recharts, setRecharts] = useState<typeof import('recharts') | null>(null);
  useEffect(() => {
    import('recharts').then(setRecharts);
  }, []);

  if (!Recharts) {
    return (
      <div className="flex items-center justify-center h-full text-gray-300 text-sm">
        Loading chart…
      </div>
    );
  }

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

  const tickFormatter = (d: string) => {
    if (period === '1y' || period === '3m') return d;
    return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };
  const labelFormatter = (label: string) => {
    if (period === '1y' || period === '3m') return label;
    return new Date(label).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Show fewer X ticks on large datasets
  const tickCount = data.length > 14 ? 6 : data.length;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FF6B00" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={tickFormatter}
          tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter,sans-serif' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter,sans-serif' }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'Inter,sans-serif', fontSize: '12px' }}
          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          labelFormatter={labelFormatter}
          cursor={{ stroke: '#FF6B00', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#FF6B00"
          strokeWidth={2.5}
          fill="url(#revGrad)"
          dot={false}
          activeDot={{ r: 5, fill: '#FF6B00', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const [Recharts, setRecharts] = useState<typeof import('recharts') | null>(null);
  useEffect(() => { import('recharts').then(setRecharts); }, []);
  if (!Recharts) return <div className="h-full flex items-center justify-center text-gray-300 text-sm">Loading…</div>;
  const { ResponsiveContainer, PieChart, Pie, Cell } = Recharts;
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} innerRadius={48} paddingAngle={3} strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
interface AdminDashboardClientProps { stats: DashboardStats; }

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const [refreshing,   setRefreshing]   = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>('7d');

  const revenueData = useMemo(() => generateRevenueData(activePeriod), [activePeriod]);
  const statusData  = stats.ordersByStatus.length > 0 ? stats.ordersByStatus : DUMMY_STATUS;
  const total       = statusData.reduce((s, d) => s + d.count, 0);

  const kpi = {
    revenue: stats.totalRevenue  > 0 ? stats.totalRevenue  : 482950,
    orders:  stats.totalOrders   > 0 ? stats.totalOrders   : 1240,
    avg:     stats.avgOrderValue > 0 ? stats.avgOrderValue : 389,
    pending: stats.pendingOrders > 0 ? stats.pendingOrders : 14,
  };

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); };

  const STAT_CARDS = [
    { label: 'Total Revenue',  value: formatPrice(kpi.revenue),               icon: IndianRupee, trend: '+12.4%', trendUp: true,  trendLabel: 'vs last week', sparkColor: '#FF6B00', iconBg: 'bg-orange-50', iconColor: 'text-[#FF6B00]' },
    { label: 'Total Orders',   value: kpi.orders.toLocaleString('en-IN'),      icon: ShoppingBag, trend: '+8.2%',  trendUp: true,  trendLabel: 'vs last week', sparkColor: '#3B82F6', iconBg: 'bg-blue-50',   iconColor: 'text-blue-600' },
    { label: 'Avg Order Value',value: formatPrice(kpi.avg),                    icon: TrendingUp,  trend: 'Steady', trendUp: null,  trendLabel: 'no change',    sparkColor: '#16A34A', iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
    { label: 'Pending Orders', value: kpi.pending.toString(),                  icon: Clock,       trend: 'Urgent', trendUp: false, trendLabel: 'needs action', sparkColor: '#F59E0B', iconBg: 'bg-amber-50',  iconColor: 'text-amber-600' },
  ];

  const periodLabel = {
    '7d': 'Last 7 Days', '1m': 'Last Month', '3m': 'Last 3 Months', '1y': 'Last Year',
  }[activePeriod];

  return (
    <div className="space-y-6">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your business at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <LiveClock />
          </div>
          <button className="relative w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-all duration-200">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>
          <button onClick={handleRefresh} className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-all duration-200">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-100 hover:shadow-md transition-all duration-300" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <Sparkline data={SPARKLINE_DATA} color={card.sparkColor} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{card.value}</p>
            <div className="flex items-center gap-1.5">
              {card.trendUp === true  && <span className="flex items-center gap-0.5 text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md"><ArrowUpRight className="w-3 h-3" />{card.trend}</span>}
              {card.trendUp === false && <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md"><AlertTriangle className="w-3 h-3" />{card.trend}</span>}
              {card.trendUp === null  && <span className="flex items-center gap-0.5 text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md"><ArrowRight className="w-3 h-3" />{card.trend}</span>}
              <span className="text-xs text-gray-400">{card.trendLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Chart + Donut ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-gray-900 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                Revenue — <span className="text-gray-400 font-semibold text-sm">{periodLabel}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily earnings overview</p>
            </div>
            {/* Period Filter Tabs */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setActivePeriod(p.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activePeriod === p.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: 260 }}>
            <RevenueChart data={revenueData} period={activePeriod} />
          </div>

          {/* Summary row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400">Total ({periodLabel})</p>
              <p className="text-lg font-bold text-gray-900">
                ₹{revenueData.reduce((s, d) => s + d.revenue, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4% vs prev period
            </span>
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Order Status</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live breakdown today</p>
          </div>
          <div style={{ height: 180 }}>
            <DonutChart data={statusData} />
          </div>
          <div className="space-y-2.5 mt-3">
            {statusData.map((d, i) => (
              <div key={d.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  <span className="text-xs font-medium text-gray-600">{d.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{d.count}</span>
                  <span className="text-[10px] text-gray-400">({Math.round((d.count / total) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Low Stock + Live Orders ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Low Stock Alerts</h3>
              <p className="text-xs text-gray-400">Partner restaurant inventory</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100">
              🔥 {STOCK_ALERTS.filter(a => a.level === 'critical').length} Critical
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {STOCK_ALERTS.map((alert) => (
              <div key={`${alert.restaurant}-${alert.item}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{alert.item}</p>
                  <p className="text-xs text-gray-400 truncate">{alert.restaurant}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className="text-xs text-gray-500">{alert.stock}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.level === 'critical' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {alert.level === 'critical' ? 'Critical' : 'Low'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Live Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Recent Live Orders</h3>
              <p className="text-xs text-gray-400">Real-time order feed</p>
            </div>
            <button className="text-xs font-semibold text-[#FF6B00] hover:underline">View All →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {LIVE_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[order.statusColor]}`}>{order.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{order.customer}</p>
                  <p className="text-xs text-gray-400 truncate">{order.restaurant}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 ml-3 flex-shrink-0">₹{order.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

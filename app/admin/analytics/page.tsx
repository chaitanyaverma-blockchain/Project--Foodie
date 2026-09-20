import React from 'react';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Users, ArrowUpRight } from 'lucide-react';
import { AnalyticsRevenueChart } from '@/components/admin/AnalyticsChartClient';


export const metadata = { title: 'Analytics & Reports | Foodie Admin' };

const MONTHLY_DATA = [
  { month: 'Feb', revenue: 320000, orders: 840 },
  { month: 'Mar', revenue: 410000, orders: 1020 },
  { month: 'Apr', revenue: 375000, orders: 940 },
  { month: 'May', revenue: 460000, orders: 1150 },
  { month: 'Jun', revenue: 428000, orders: 1080 },
  { month: 'Jul', revenue: 482950, orders: 1240 },
];

const TOP_ITEMS = [
  { name: 'Chicken Biryani', orders: 342, revenue: 171000, category: 'Biryani' },
  { name: 'Paneer Butter Masala', orders: 289, revenue: 115600, category: 'North Indian' },
  { name: 'Margherita Pizza', orders: 234, revenue: 105300, category: 'Pizza' },
  { name: 'Classic Burger', orders: 198, revenue: 59400, category: 'Burgers' },
  { name: 'Masala Dosa', orders: 187, revenue: 46750, category: 'South Indian' },
];

const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Admin / Growth</p>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Analytics & Reports
          </h1>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue (Jul)', value: '₹4,82,950', change: '+12.4%', icon: IndianRupee, color: 'bg-orange-50 text-orange-500' },
          { label: 'Total Orders (Jul)', value: '1,240', change: '+8.2%', icon: ShoppingBag, color: 'bg-blue-50 text-blue-500' },
          { label: 'Active Customers', value: '3,840', change: '+5.1%', icon: Users, color: 'bg-green-50 text-green-500' },
          { label: 'Avg Daily Revenue', value: '₹69,007', change: '+3.7%', icon: TrendingUp, color: 'bg-purple-50 text-purple-500' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">{kpi.value}</p>
            <p className="text-xs text-gray-400 mb-2">{kpi.label}</p>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 w-fit">
              <ArrowUpRight className="w-3 h-3" />{kpi.change}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Revenue Over Time</h3>
              <p className="text-xs text-gray-400 mt-0.5">Detailed earnings analysis</p>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <AnalyticsRevenueChart />
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="font-bold text-gray-900 text-sm mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>Top Selling Items</h3>
          <div className="space-y-4">
            {TOP_ITEMS.map((item, i) => {
              const maxOrders = TOP_ITEMS[0].orders;
              const pct = Math.round((item.orders / maxOrders) * 100);
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                      <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{item.orders} orders</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: i === 0 ? 'linear-gradient(90deg, #FF6B00, #FF7A1A)' : '#D1D5DB' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

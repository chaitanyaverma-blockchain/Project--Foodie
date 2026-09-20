import React from 'react';
import { Store, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export const metadata = { title: 'Partner Restaurants | Foodie Admin' };

const RESTAURANTS = [
  { name: 'Burger Junction', status: 'active', orders: 342, rating: 4.5, joined: '2026-01-15', pendingApproval: false },
  { name: 'Pizza Palace', status: 'active', orders: 289, rating: 4.7, joined: '2026-02-03', pendingApproval: false },
  { name: 'Spice Garden', status: 'active', orders: 198, rating: 4.3, joined: '2026-02-28', pendingApproval: false },
  { name: 'Sushi Bar', status: 'pending', orders: 0, rating: 0, joined: '2026-07-04', pendingApproval: true },
  { name: 'Sandwich Hub', status: 'inactive', orders: 45, rating: 3.9, joined: '2026-03-10', pendingApproval: false },
  { name: 'Taco Town', status: 'pending', orders: 0, rating: 0, joined: '2026-07-05', pendingApproval: true },
];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border border-green-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
};

export default function PartnerRestaurantsPage() {
  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Admin / Management</p>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Partner Restaurants
            <span className="ml-2 text-sm font-semibold text-gray-400">({RESTAURANTS.length} total)</span>
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Partners', value: RESTAURANTS.filter(r => r.status === 'active').length, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Pending Approval', value: RESTAURANTS.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Inactive', value: RESTAURANTS.filter(r => r.status === 'inactive').length, icon: AlertCircle, color: 'text-gray-500 bg-gray-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-sm">All Restaurants</h2>
          <span className="text-xs text-gray-400">{RESTAURANTS.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Restaurant</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Total Orders</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Rating</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Joined</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {RESTAURANTS.map((r, i) => (
                <tr key={r.name} className={`${i < RESTAURANTS.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/60 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status]}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{r.orders.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.rating > 0 ? `⭐ ${r.rating}` : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(r.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-right">
                    {r.pendingApproval ? (
                      <div className="flex gap-2 justify-end">
                        <button className="text-xs font-bold px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                        <button className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">Reject</button>
                      </div>
                    ) : (
                      <button className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Manage</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

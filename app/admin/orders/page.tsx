'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';
import { formatPrice, STATUS_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';

const FULFILLMENT_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const STATUS_BADGE_COLORS: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  preparing: 'bg-yellow-50 text-yellow-700',
  out_for_delivery: 'bg-orange-50 text-orange-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('fulfillment_status', filter);
      }

      const { data } = await query;
      setOrders((data ?? []) as Order[]);
      setLoading(false);
    };

    fetchOrders();

    // Real-time subscription
    const subscription = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      // @ts-expect-error Supabase types issue
      .update({ fulfillment_status: newStatus })
      .eq('id', orderId);

    if (error) { toast.error(error.message); return; }

    // Add timeline entry
    // @ts-ignore Supabase types issue
    await supabase.from('order_timeline').insert({
      order_id: orderId,
      status: newStatus,
      note: `Status updated to: ${STATUS_LABELS[newStatus] ?? newStatus}`,
    });

    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, fulfillment_status: newStatus as Order['fulfillment_status'] } : o));
    toast.success('Order status updated!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">Live Orders</h1>
        <p className="text-gray-500 mt-1">Real-time order management pipeline</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', ...FULFILLMENT_STATUSES].map((s) => (
          <button
            key={s}
            id={`filter-${s}`}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              filter === s
                ? 'bg-[#FF6B00] text-white shadow-orange'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF6B00]'
            }`}
          >
            {s === 'all' ? 'All Orders' : STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded shimmer" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <a
                          href={`/orders/${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm font-bold text-[#FF6B00] hover:underline"
                        >
                          {order.order_number}
                        </a>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {(order.delivery_address as unknown as { full_name: string })?.full_name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(order.delivery_address as unknown as { phone: string })?.phone}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{order.order_items?.length ?? 0} items</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${
                          order.payment_status === 'paid' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {order.payment_status}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_BADGE_COLORS[order.fulfillment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[order.fulfillment_status] ?? order.fulfillment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          id={`order-status-${order.id}`}
                          value={order.fulfillment_status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-200 dark:border-[#3F3F46] dark:bg-[#242934] rounded-lg px-2 py-1.5 text-text-primary focus:outline-none focus:border-[#FF6B00] cursor-pointer"
                        >
                          {FULFILLMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                          ))}
                        </select>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>

          {!loading && orders.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

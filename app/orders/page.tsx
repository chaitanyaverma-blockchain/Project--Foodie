'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, ChevronRight, PackageSearch } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, STATUS_LABELS } from '@/lib/utils';
import type { Order } from '@/types';
import { redirect } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700 border-blue-100',
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  preparing: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-100',
  delivered: 'bg-green-50 text-green-700 border-green-100',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/auth/login?next=/orders';
      return;
    }
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as Order[]);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <div className="container max-w-3xl">
          <div className="h-8 w-48 shimmer rounded-xl mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 shimmer rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-16">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">My Orders</h1>
          <p className="text-[#6B6B6B] mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-16 shadow-card text-center"
          >
            <PackageSearch className="w-16 h-16 text-gray-200 mx-auto mb-5" />
            <h2 className="font-serif font-bold text-xl text-text-primary mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8">Your past orders will appear here once you start ordering.</p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-colors shadow-orange"
            >
              Explore Menu <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-black text-base text-[#1A1A1A]">
                          #{order.order_number}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.fulfillment_status] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                          {STATUS_LABELS[order.fulfillment_status] ?? order.fulfillment_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {order.order_items && order.order_items.length > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          {order.order_items.slice(0, 2).map((i) => i.title).join(', ')}
                          {order.order_items.length > 2 && ` +${order.order_items.length - 2} more`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price + Track */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <p className="font-bold text-lg text-[#1A1A1A]">{formatPrice(order.total)}</p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-[#FF6B00] hover:gap-2.5 transition-all group"
                    >
                      {order.fulfillment_status === 'delivered'
                        ? <><CheckCircle className="w-4 h-4" /> View Details</>
                        : <>Track Order <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                      }
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

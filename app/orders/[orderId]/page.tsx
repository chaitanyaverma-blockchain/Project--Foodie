'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat, Bike, Home, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderTimeline } from '@/types';
import { formatPrice } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/utils';

const TIMELINE_STEPS = [
  { status: 'placed', label: 'Order Placed', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  { status: 'confirmed', label: 'Order Confirmed', icon: Clock, color: 'text-indigo-600 bg-indigo-50' },
  { status: 'preparing', label: 'Kitchen Preparing', icon: ChefHat, color: 'text-yellow-600 bg-yellow-50' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, color: 'text-orange-600 bg-orange-50' },
  { status: 'delivered', label: 'Delivered', icon: Home, color: 'text-green-600 bg-green-50' },
];

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<OrderTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch order
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', params.orderId)
        .single();
      setOrder(data as Order);
    };

    // Fetch timeline
    const fetchTimeline = async () => {
      const { data } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', params.orderId)
        .order('created_at');
      setTimeline((data ?? []) as OrderTimeline[]);
      setLoading(false);
    };

    fetchOrder();
    fetchTimeline();

    // Subscribe to real-time timeline updates
    const subscription = supabase
      .channel(`order-tracking-${params.orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_timeline',
          filter: `order_id=eq.${params.orderId}`,
        },
        (payload) => {
          setTimeline((prev) => [...prev, payload.new as OrderTimeline]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${params.orderId}`,
        },
        (payload) => {
          setOrder((prev) => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.orderId]);

  const completedStatuses = timeline.map((t) => t.status);
  const currentStatus = timeline[timeline.length - 1]?.status ?? 'placed';

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-16">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-2">
            {currentStatus === 'delivered' ? 'Order Delivered! 🎉' : 'Tracking Your Order'}
          </h1>
          <p className="text-[#6B6B6B]">
            Order #{order?.order_number}
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-orange-50 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              currentStatus === 'delivered' ? 'bg-green-500' : 'bg-[#FF6B00]'
            }`} />
            <span className="text-sm font-semibold text-[#FF6B00]">
              {STATUS_LABELS[currentStatus] ?? currentStatus}
            </span>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="bg-white rounded-2xl p-8 shadow-card mb-6">
          <h2 className="font-serif font-bold text-lg mb-8 text-[#1A1A1A]">Order Status</h2>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, i) => {
              const isCompleted = completedStatuses.includes(step.status);
              const isCurrent = currentStatus === step.status;
              const isLast = i === TIMELINE_STEPS.length - 1;

              return (
                <div key={step.status} className="flex gap-5">
                  {/* Icon Column */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={isCompleted ? { scale: 0 } : false}
                      animate={isCompleted ? { scale: 1 } : {}}
                      transition={{ type: 'spring', delay: i * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 ${
                        isCompleted
                          ? step.color + ' border-transparent'
                          : 'bg-gray-50 text-gray-300 border-gray-200'
                      } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}
                    >
                      <step.icon className="w-5 h-5" />
                    </motion.div>
                    {!isLast && (
                      <div className={`w-0.5 h-12 my-1 transition-all duration-700 ${
                        isCompleted ? 'bg-[#FF6B00]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 pb-12">
                    <p className={`font-semibold text-sm leading-tight ${
                      isCompleted ? 'text-[#1A1A1A]' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#FF6B00] font-medium mt-0.5"
                      >
                        {timeline.find((t) => t.status === step.status)?.note ?? 'In progress...'}
                      </motion.p>
                    )}
                    {isCompleted && !isCurrent && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {timeline.find((t) => t.status === step.status)?.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address */}
        {order?.delivery_address && (
          <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <h3 className="font-serif font-bold text-base">Delivery Address</h3>
            </div>
            <p className="text-sm text-text-secondary font-medium">
              {(order.delivery_address as unknown as { full_name: string }).full_name}
            </p>
            <p className="text-sm text-gray-500">
              {(order.delivery_address as unknown as { line1: string }).line1},{' '}
              {(order.delivery_address as unknown as { city: string }).city},{' '}
              {(order.delivery_address as unknown as { state: string }).state} -{' '}
              {(order.delivery_address as unknown as { pincode: string }).pincode}
            </p>
          </div>
        )}

        {/* Order Items */}
        {order?.order_items && order.order_items.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-serif font-bold text-base mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{item.title}</p>
                    {Object.entries(item.variant_info ?? {}).length > 0 && (
                      <p className="text-xs text-gray-400">{Object.values(item.variant_info).join(', ')}</p>
                    )}
                    <p className="text-xs text-gray-400">× {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(item.line_total)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[#FF6B00]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

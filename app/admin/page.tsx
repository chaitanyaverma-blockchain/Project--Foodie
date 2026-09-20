import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

import type { DashboardStats, FoodItem } from '@/types';

export const metadata = { title: 'Dashboard | Foodie Admin' };
export const revalidate = 30;

async function getDashboardData() {
  const supabase = await createClient();

  const [ordersRes, revenueRes, soldOutRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total, fulfillment_status, payment_status, created_at')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('orders')
      .select('total, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('food_items')
      .select('id, name, image_url, stock_status')
      .eq('stock_status', 'sold_out')
  ]);

  const orders = ordersRes.data ?? [];
  const revenueOrders = revenueRes.data ?? [];
  const soldOutItems = soldOutRes.data ?? [];

  const totalRevenue = orders.reduce((sum: number, o: {total: number}) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter((o: {fulfillment_status: string}) =>
    ['placed', 'confirmed', 'preparing'].includes(o.fulfillment_status)
  ).length;

  // Revenue by day (last 7 days)
  const dayMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().split('T')[0]] = 0;
  }
  revenueOrders.forEach((o: {total: number; created_at: string}) => {
    const day = o.created_at.split('T')[0];
    if (dayMap[day] !== undefined) dayMap[day] += o.total;
  });
  const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue }));

  const statusCounts: Record<string, number> = {};
  orders.forEach((o: {fulfillment_status: string}) => {
    statusCounts[o.fulfillment_status] = (statusCounts[o.fulfillment_status] ?? 0) + 1;
  });
  const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  return { totalRevenue, totalOrders, avgOrderValue, pendingOrders, revenueByDay, ordersByStatus, soldOutItems };
}

export default async function AdminDashboard() {
  const stats = await getDashboardData();

  return (
    <Suspense fallback={<div className="h-96 shimmer rounded-2xl" />}>
      <AdminDashboardClient stats={stats} />
    </Suspense>
  );
}

import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin Panel | Foodie' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as any)?.role !== 'admin') redirect('/');

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>
      <AdminSidebar />
      {/* pt-16 md:pt-20 offsets the fixed top navbar (h-16 on mobile / h-20 on desktop) */}
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen pt-16 md:pt-20">
        <div className="p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}

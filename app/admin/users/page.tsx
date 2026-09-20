import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Users, ShieldCheck, UserCheck, UserX } from 'lucide-react';

export const metadata = { title: 'Users | Foodie Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at, phone, avatar_url')
    .order('created_at', { ascending: false });

  const allUsers = users ?? [];
  const admins = allUsers.filter(u => u.role === 'admin');
  const customers = allUsers.filter(u => u.role === 'customer');

  const ROLE_STYLES: Record<string, string> = {
    admin: 'bg-orange-50 text-orange-700 border border-orange-200',
    customer: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Admin / Growth</p>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Users
            <span className="ml-2 text-sm font-semibold text-gray-400">({allUsers.length} total)</span>
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: allUsers.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Admins', value: admins.length, icon: ShieldCheck, color: 'text-orange-600 bg-orange-50' },
          { label: 'Customers', value: customers.length, icon: UserCheck, color: 'text-green-600 bg-green-50' },
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-sm">All Users</h2>
          <span className="text-xs text-gray-400">{allUsers.length} total</span>
        </div>

        {allUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <UserX className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Role</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Joined</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u, i) => {
                  const initials = u.full_name
                    ? u.full_name.slice(0, 2).toUpperCase()
                    : u.email?.slice(0, 2).toUpperCase() ?? '??';
                  return (
                    <tr
                      key={u.id}
                      className={`${i < allUsers.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/60 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                            style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,#FF6B00,#FF7A1A)' : 'linear-gradient(135deg,#3B82F6,#60A5FA)' }}
                          >
                            {initials}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{u.full_name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${ROLE_STYLES[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{u.phone ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

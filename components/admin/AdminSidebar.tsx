'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChefHat, LayoutDashboard, UtensilsCrossed, ShoppingBag,
  Tag, LogOut, Users, Bike, BarChart3, Store, Settings, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/orders', label: 'Live Orders', icon: ShoppingBag, badge: '14', badgeColor: 'bg-red-500' },
    ]
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/menu', label: 'Menu Management', icon: UtensilsCrossed },
      { href: '/admin/recipes', label: 'Recipe Community', icon: ChefHat },
      { href: '/admin/restaurants', label: 'Partner Restaurants', icon: Store },
      { href: '/admin/fleet', label: 'Delivery Fleet', icon: Bike },
    ]
  },
  {
    label: 'Growth',
    items: [
      { href: '/admin/coupons', label: 'Coupons & Campaigns', icon: Tag },
      { href: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 },
      { href: '/admin/users', label: 'Users', icon: Users },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.slice(0, 2).toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-[60] overflow-hidden" style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.04)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF7A1A 100%)' }}>
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-gray-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Foodie</span>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#FF6B00' }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-3 mb-2">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                      active
                        ? 'text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    style={active ? { background: 'linear-gradient(135deg, #FF6B00 0%, #FF7A1A 100%)', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' } : {}}
                  >
                    {/* Left border indicator for non-active hover */}
                    {!active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 rounded-full bg-orange-500 transition-all duration-200 group-hover:h-5" />
                    )}
                    <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-gray-400 group-hover:text-orange-500')} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className={cn('text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center', active ? 'bg-white/30' : item.badgeColor)}>
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Card */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF7A1A 100%)' }}>
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all duration-150"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-gray-200">
            <button
              id="admin-logout-btn"
              onClick={signOut}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

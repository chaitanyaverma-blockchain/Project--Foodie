'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Menu, X, User, LogOut, ChefHat, LayoutDashboard, Sun, Moon, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useFavourites } from '@/context/FavouritesContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/community', label: 'Community' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const { favoriteCount } = useFavourites();
  const { itemCount, cartIconRef } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const prevCount = useRef(itemCount);

  // Track scroll for header styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Expose cart open setter globally so CartDrawer can use it
  useEffect(() => {
    (window as Window & { openCart?: () => void }).openCart = () => setCartOpen(true);
    return () => {
      delete (window as Window & { openCart?: () => void }).openCart;
    };
  }, []);

  // Sync cart open state with CartDrawer
  useEffect(() => {
    const handler = (e: CustomEvent) => setCartOpen(e.detail);
    window.addEventListener('foodie:cartopen' as keyof WindowEventMap, handler as EventListener);
    return () => window.removeEventListener('foodie:cartopen' as keyof WindowEventMap, handler as EventListener);
  }, []);

  const isHero = pathname === '/' || pathname === '/about';

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled || !isHero
            ? 'bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.5)] border-b border-gray-100 dark:border-[#2A2A2A]'
            : 'bg-transparent'
        )}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-[#FF6B00] rounded-xl flex items-center justify-center shadow-orange group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span
                className={cn(
                  'font-serif font-bold text-2xl tracking-tight transition-colors',
                  scrolled || !isHero ? 'text-[#1A1A1A] dark:text-white' : 'text-white'
                )}
              >
                Foodie
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-semibold transition-colors relative group',
                    scrolled || !isHero ? 'text-[#6B6B6B] dark:text-gray-300' : 'text-white/80',
                    pathname === link.href
                      ? (scrolled || !isHero ? 'text-[#FF6B00]' : 'text-white')
                      : 'hover:text-[#FF6B00]'
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  'hidden md:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
                  scrolled || !isHero ? 'text-[#6B6B6B] dark:text-gray-300' : 'text-white'
                )}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Search icon (desktop) */}
              <Link
                href="/menu"
                className={cn(
                  'hidden md:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
                  scrolled || !isHero ? 'text-[#6B6B6B] dark:text-gray-300' : 'text-white'
                )}
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Favorites Button */}
              <Link
                href="/favorites"
                className={cn(
                  'relative hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all',
                  scrolled || !isHero
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
                )}
              >
                <Heart className={cn("w-4 h-4", favoriteCount > 0 && "fill-current")} />
                <span className="hidden lg:inline">Favorites</span>
                <AnimatePresence>
                  {favoriteCount > 0 && (
                    <motion.span
                      key={favoriteCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center shadow-sm"
                    >
                      {favoriteCount > 9 ? '9+' : favoriteCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Cart Button */}
              <motion.div
                ref={cartIconRef}
                className="relative"
              >
                <button
                  id="cart-btn"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('foodie:togglecart'));
                  }}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all',
                    scrolled || !isHero
                      ? 'bg-[#FF6B00] text-white hover:bg-[#E56000] shadow-orange'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#FF6B00] rounded-full text-xs font-black flex items-center justify-center shadow-sm"
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    id="user-menu-btn"
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors',
                      scrolled || !isHero
                        ? 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
                    )}
                  >
                    {profile?.full_name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-semibold text-gray-900">{profile?.full_name ?? 'Welcome!'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            My Orders
                          </Link>
                          {isAdmin && (
                            <a
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF6B00] font-semibold hover:bg-orange-50 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Admin Panel
                            </a>
                          )}
                        </div>
                        <div className="border-t border-gray-50 py-1">
                          <button
                            onClick={() => { signOut(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className={cn(
                    'hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    scrolled || !isHero
                      ? 'text-[#6B6B6B] hover:text-[#FF6B00] hover:bg-orange-50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}

              {/* Mobile Hamburger */}
              <button
                id="mobile-menu-btn"
                className={cn(
                  'md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors',
                  scrolled || !isHero ? 'text-[#1A1A1A] hover:bg-gray-100' : 'text-white hover:bg-white/10'
                )}
                onClick={() => setMobileOpen((p) => !p)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="container py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                      pathname === link.href
                        ? 'bg-orange-50 text-[#FF6B00]'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-[#FF6B00] hover:bg-orange-50 transition-colors"
                  >
                    Sign In / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Click-outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
}

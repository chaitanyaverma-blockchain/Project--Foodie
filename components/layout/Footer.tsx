'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const LINKS = {
  company: [
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Careers' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Press' },
  ],
  explore: [
    { href: '/menu', label: 'Browse Menu' },
    { href: '/menu?categories=north-indian', label: 'North Indian' },
    { href: '/menu?categories=desserts', label: 'Desserts' },
    { href: '/menu?categories=healthy', label: 'Healthy' },
  ],
  support: [
    { href: '#', label: 'Help Center' },
    { href: '#', label: 'Contact Us' },
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
  ],
};

const SOCIAL = [
  { href: '#', icon: Instagram, label: 'Instagram' },
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Facebook, label: 'Facebook' },
];

export function Footer() {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '#') {
      e.preventDefault();
      toast('Coming soon!', { icon: '🚀' });
    }
  };

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Main Footer */}
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 pr-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#FF6B00] rounded-xl flex items-center justify-center shadow-orange">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-xl">Foodie</span>
            </Link>
            <p className="text-gray-400 text-[13px] leading-relaxed max-w-[260px]">
              Premium food delivery from the finest restaurants and home kitchens. 
              Experience culinary excellence, delivered fresh to your door.
            </p>
            {/* Contact */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                <span>hello@foodie.app</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-2.5 mt-5">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  onClick={(e) => handleLinkClick(e, s.href)}
                  aria-label={s.label}
                  className="w-8 h-8 bg-white/5 hover:bg-[#FF6B00] rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-gray-300 mb-3.5">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link, idx) => (
                  <li key={`${link.href}-${idx}`}>
                    {link.href === '#' ? (
                      <button
                        type="button"
                        onClick={(e) => handleLinkClick(e as any, link.href)}
                        className="text-gray-400 hover:text-white text-[13px] transition-colors duration-150 hover:translate-x-1 inline-block cursor-pointer text-left bg-transparent border-none p-0 m-0"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white text-[13px] transition-colors duration-150 hover:translate-x-1 inline-block cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-[11px]">
            © {new Date().getFullYear()} Foodie. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-[11px] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-[11px] transition-colors">Terms</Link>
            <Link href="/sitemap" className="text-gray-500 hover:text-white text-[11px] transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

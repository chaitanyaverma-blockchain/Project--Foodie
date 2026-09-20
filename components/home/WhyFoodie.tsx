'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Leaf, Clock, Star, Headphones } from 'lucide-react';

const FEATURES = [
  {
    icon: Clock,
    title: '30-Min Delivery',
    description: 'Lightning-fast delivery guaranteed. Your food arrives hot and fresh every time.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Shield,
    title: '100% Safe & Hygienic',
    description: 'All our partner kitchens follow strict food safety and hygiene standards.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Leaf,
    title: 'Fresh Ingredients',
    description: 'We source only the finest, freshest ingredients from trusted local suppliers.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Zap,
    title: 'Easy Ordering',
    description: 'Order in under a minute with our streamlined checkout and saved addresses.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Star,
    title: 'Curated Menus',
    description: 'Every dish is handpicked and reviewed by our in-house culinary team.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our support team is always available to resolve any issue instantly.',
    color: 'bg-orange-50 text-orange-600',
  },
];

export function WhyFoodie() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-[#FF6B00] text-sm font-bold uppercase tracking-widest mb-3">Why Choose Us</p>
          <h2 className="font-serif text-4xl font-bold text-[#1A1A1A] dark:text-[#F5EFE6] mb-4">
            The Foodie Difference
          </h2>
          <p className="text-[#6B6B6B] dark:text-[#B8AFA4] max-w-xl mx-auto">
            We are not just a food delivery app. We are a premium culinary experience platform 
            dedicated to bringing restaurant-quality food to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-white dark:bg-[#F3EDE3] rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-50 dark:border-[#E8E0D4]"
            >
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-[#2C2520] mb-2">{f.title}</h3>
              <p className="text-[#6B6B6B] dark:text-[#5C534A] text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

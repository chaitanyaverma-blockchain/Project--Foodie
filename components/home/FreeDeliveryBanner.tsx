'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Sparkles } from 'lucide-react';

export function FreeDeliveryBanner() {
  return (
    <section className="py-4">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FBBF24] p-5 sm:p-6"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white rounded-full" />
          </div>

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
              >
                <Truck className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                  Free Delivery
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                </h3>
                <p className="text-white/80 text-sm">
                  On all orders above <span className="font-bold text-white">₹299</span>
                </p>
              </div>
            </div>
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-white text-[#FF6B00] rounded-xl text-sm font-bold cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            >
              Order Now
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

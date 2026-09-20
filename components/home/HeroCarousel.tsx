'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { debounce } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const SLIDES = [
  {
    id: 1,
    headline: 'Gourmet Food Delivered Fresh',
    subtext: 'Experience the finest culinary creations from top chefs — at your doorstep in 30 minutes.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80',
    cta: 'Order Now',
    ctaHref: '/menu',
    badge: '🔥 Trending Today',
  },
  {
    id: 2,
    headline: 'Authentic North Indian Flavours',
    subtext: 'Slow-cooked curries, buttery naans, and biryani that tells a story.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1600&q=80',
    cta: 'Explore Menu',
    ctaHref: '/menu?category=north-indian',
    badge: '⭐ Chef\'s Special',
  },
  {
    id: 3,
    headline: 'Desserts Worth the Indulgence',
    subtext: 'Artisanal desserts crafted to perfection — because every meal deserves a sweet ending.',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1600&q=80',
    cta: 'View Desserts',
    ctaHref: '/menu?category=desserts',
    badge: '🍰 Fan Favourite',
  },
];

const WORD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setCurrent((p) => (p + 1) % SLIDES.length);
  const prev = () => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const slide = SLIDES[current];
  const words = slide.headline.split(' ');

  return (
    <section className="relative h-[85vh] min-h-[560px] max-h-[800px] overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.headline}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container relative h-full flex flex-col justify-center pt-20">
        <div className="max-w-xl">
          {/* Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${slide.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-300" />
              {slide.badge}
            </motion.div>
          </AnimatePresence>

          {/* Staggered Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`headline-${slide.id}`}
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
            >
              {words.map((word, i) => (
                <motion.span
                  key={`${slide.id}-${i}`}
                  custom={i}
                  variants={WORD_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          </AnimatePresence>

          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${slide.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-white/80 text-base md:text-lg leading-relaxed mb-8"
            >
              {slide.subtext}
            </motion.p>
          </AnimatePresence>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-3 mb-6"
          >
            <div className="flex-1 flex items-center gap-3 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-xl border border-transparent dark:border-[#353B46]">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                id="hero-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Craving Biryani? Search for dishes..."
                className="flex-1 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder:text-[#9CA3AF] text-sm font-medium focus:outline-none"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="px-6 shadow-orange">
              Search
            </Button>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href={slide.ctaHref}>
              <Button variant="outline" size="md" className="border-white text-white hover:bg-white hover:text-[#FF6B00]">
                {slide.cta}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-6 h-2 bg-[#FF6B00]' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

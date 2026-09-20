'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, Heart, Leaf, Award, Users, Star, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

const TEAM = [
  {
    name: 'Arjun Mehta',
    role: 'Founder & CEO',
    bio: 'Former Michelin-starred chef turned entrepreneur, passionate about democratising gourmet food.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Culinary',
    bio: 'Trained in Paris, Priya handpicks every recipe and ensures only the finest kitchens partner with us.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
  {
    name: 'Rohan Kapoor',
    role: 'CTO',
    bio: 'Tech wizard who built our real-time kitchen-to-door tracking system from the ground up.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  },
];

const STATS = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '200+', label: 'Gourmet Dishes' },
  { value: '30 min', label: 'Average Delivery' },
  { value: '4.9 ★', label: 'App Rating' },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Made with Love',
    desc: 'Every dish is crafted with passion by chefs who care deeply about what ends up on your plate.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Leaf,
    title: 'Fresh & Sustainable',
    desc: 'We source seasonal, local produce and partner with sustainable kitchens to reduce our footprint.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    desc: 'Our in-house culinary team evaluates every partner kitchen before they appear on Foodie.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    title: 'Community First',
    desc: 'We support local home chefs and cloud kitchens, bringing unique regional flavours to your table.',
    color: 'bg-blue-50 text-blue-600',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80"
            alt="About Foodie"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
        <div className="container relative pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#FF6B00] rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-[#FF6B00] font-bold text-sm uppercase tracking-widest">Our Story</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
              Food is more than <span className="text-[#FF6B00]">just a meal</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Foodie was born from a simple belief — everyone deserves access to restaurant-quality food,
              delivered with care and speed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#FF6B00]">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-serif font-bold text-3xl md:text-4xl text-white mb-1">{stat.value}</p>
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#FFFDF9]">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#FF6B00] text-sm font-bold uppercase tracking-widest mb-4">Our Mission</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 leading-tight">
              Bringing the world's finest flavours to your doorstep
            </h2>
            <p className="text-[#6B6B6B] text-lg leading-relaxed">
              We partner exclusively with kitchens that share our obsession with quality. Every restaurant
              on Foodie is vetted, every ingredient is fresh, and every delivery is tracked in real-time
              from the moment the chef starts cooking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[#FF6B00] text-sm font-bold uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="font-serif text-4xl font-bold text-[#1A1A1A]">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-center"
              >
                <div className={`w-14 h-14 ${val.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <val.icon className="w-7 h-7" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mb-2">{val.title}</h3>
                <p className="text-[#6B6B6B] text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#FFFDF9]">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[#FF6B00] text-sm font-bold uppercase tracking-widest mb-3">The People</p>
            <h2 className="font-serif text-4xl font-bold text-[#1A1A1A]">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-2xl p-6 shadow-card text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover rounded-full border-4 border-orange-100"
                    sizes="96px"
                  />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">{member.name}</h3>
                <p className="text-[#FF6B00] font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-[#6B6B6B] text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <p className="text-[#FF6B00] text-sm font-bold uppercase tracking-widest mb-3">Get in Touch</p>
            <h2 className="font-serif text-4xl font-bold text-[#1A1A1A]">We'd love to hear from you</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: MapPin, label: 'Address', value: '12, Bandra West, Mumbai, MH 400050' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
              { icon: Mail, label: 'Email', value: 'hello@foodie.app' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-5 shadow-card text-center">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <p className="font-bold text-sm text-text-primary mb-1">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#E56000] transition-colors shadow-orange text-base"
            >
              Explore Our Menu <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

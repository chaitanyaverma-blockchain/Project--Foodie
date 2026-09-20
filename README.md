# 🍽️ Foodie — Premium Food E-Commerce Platform

A full-stack, production-ready food delivery e-commerce platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Supabase**, and **Razorpay**.

## ✨ Features

### Storefront
- 🎠 Hero carousel with word-by-word staggered animation
- 🔍 Real-time predictive search with debounce
- 🍕 Dynamic menu with URL-synced filters (veg/non-veg, price, cuisine, rating)
- 🛒 Flying food-to-cart animation with spring bounce
- 🎨 Food customization modal (variants, add-ons)
- 💳 Multi-step checkout with Razorpay integration
- 📦 Real-time order tracking via Supabase Realtime
- 🎟️ Coupon code validation with countdown timer promo banner

### Admin Panel `/admin`
- 📊 Revenue & orders dashboard with Recharts
- 🍔 Full CRUD menu management with drag-and-drop image upload to Supabase Storage
- 📋 Live order pipeline with real-time status updates
- 🏷️ Coupon & discount manager

### Technical
- 🔐 Supabase Auth (email/password) with Row Level Security
- ⚡ ISR (Incremental Static Regeneration) for menu pages
- 🔔 Supabase Realtime subscriptions for order tracking
- 🪝 Razorpay webhooks (HMAC-SHA256 verified)
- 📱 Fully responsive (mobile-first)
- 🎯 SEO optimized

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd foodie-ecommerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Making Yourself Admin

After signing up, run this in your Supabase SQL editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then navigate to `/admin`.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments | Razorpay |
| Charts | Recharts |
| State | React Context + localStorage |

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Homepage
│   ├── menu/page.tsx         # Menu listing
│   ├── checkout/page.tsx     # Checkout flow
│   ├── orders/[orderId]/     # Order tracking
│   ├── auth/                 # Auth pages
│   ├── admin/               # Admin panel
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Atomic UI components
│   ├── layout/              # Header, Footer, CartDrawer
│   ├── home/                # Homepage sections
│   ├── menu/                # Menu components
│   ├── checkout/            # Checkout steps
│   └── admin/               # Admin components
├── context/                 # Cart & Auth contexts
├── lib/                     # Supabase clients, utils
├── types/                   # TypeScript types
└── supabase/                # Database migrations
```

## 🚀 Deploy to Vercel

```bash
npx vercel --prod
```

Add all environment variables in your Vercel project settings. Zero configuration needed.

## 📞 Razorpay Webhook Setup

Add a webhook in your Razorpay dashboard:
- **URL**: `https://your-domain.vercel.app/api/razorpay/webhook`
- **Events**: `payment.captured`, `payment.failed`, `refund.created`
- **Secret**: Your `RAZORPAY_WEBHOOK_SECRET`

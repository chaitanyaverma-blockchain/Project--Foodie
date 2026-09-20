MASTER PROMPT: FULL-STACK "FOODIE"
E-COMMERCE

AI INSTRUCTIONS: Treat every section of this prompt with equal priority. This is NOT a template or a
mockup. Every single feature must be fully wired to Supabase and operational. The project must be
deployable to Vercel with zero configuration issues.

THE TECH STACK

Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
Animations: Framer Motion (Tactile, premium micro-interactions)
Backend & Database: Supabase (Auth + PostgreSQL Database + Storage)
Payments: Razorpay (Elements & Server-side Webhooks)

SECTION 1: UI DESIGN SYSTEM & MICRO-INTERACTIONS

The UI must look like it was designed by a top-tier culinary design agency (think: Swiggy Gourmet, Zomato
Legends, or premium D2C food brands).
Typography & Layout
Typography: Premium serif font (Playfair Display or Clash Display) for hero headings, restaurant titles,
and food item titles. Clean sans-serif (Inter) for body text and checkout flows.
Spacing: 8px grid system. Maximum content width: 1440px centered. Grid system: 4 columns on desktop,
2 on mobile.
Color Palette
Primary Background: #FAFAFA (warm off-white)
Secondary Background: #FFFDF9 (soft warm cream)
Primary Text: #1A1A1A | Secondary Text: #6B6B6B
PRODUCTION-GRADE WEBSITE GENERATION PROMPT

•

•

•
•
•

1

Accent Color: #EA580C (Deep Culinary Orange) — used for primary CTAs and active states.
Food Indicators: Veg Badge #16A34A GREEN | Non-Veg Badge #DC2626 RED
Premium Micro-Interactions (Framer Motion)
Page Transitions: Full app wrapped in AnimatePresence with smooth fade-in and slide-up ( y: 20 ->
0 ) over 0.4s.
Food Item Cards: On hover, image scales to 1.04 . The "Add to Cart" button slides up from the bottom
with a 0.1s staggered delay.
Flying Food Effect: Clicking "Add" triggers a floating ghost image of the dish flying in a parabolic Bezier
arc straight into the header cart icon. Cart icon executes a spring bounce ( scale: 1 -> 1.3 -> 1 ).

Cart Drawer: Slides smoothly from the right ( x: 100% -> 0% ) with a deep backdrop blur ( backdrop-
blur-md ).

Skeleton Loading: Shimmer gradient placeholder animations for all menus and listings to prevent layout
shifts.

SECTION 2: STOREFRONT PAGES & FOOD ORDERING FEATURES
Homepage & Discovery
Hero Carousel: High-res food visuals with a word-by-word staggered typography animation. Floating
search bar with debounced predictive search ("Craving Biryani?").
Gourmet Categories: Horizontal scrolling grid with circular icons (e.g., North Indian, Italian, Desserts,
Healthy, Street Food).
Trending Dishes: A 4-column desktop grid displaying food items dynamically pulled from Supabase
based on top ratings and order counts.
Live Promo Banner: Displays active discount coupons (e.g., FOODIE50 ) with an animated countdown
timer.
Food Menu & Listing Page (PLP)
Dynamic Filters: Sticky sidebar/bottom-sheet. Filter by Veg/Non-Veg/Egg, Price Range (dual-thumb
slider), Cuisine, and Ratings. Real-time Supabase querying synced with URL search params.
Food Item Cards: Must include Veg/Non-Veg indicator badge, dish name, calorie/dietary info, price with
strike-through discount, and an advanced Quantity Selector ( + / - ) that updates the cart context
immediately.
Food Customisation Modal (PDP Component)
Clicking a dish opens a layered overlay modal with a large high-res food image.
Add-ons & Customisation (Variants): Multi-select checkboxes for extra toppings (e.g., "Extra Cheese",
"Add Chicken") and radio pills for sizes (e.g., "Regular", "Large"). Out-of-stock add-ons must be
dynamically crossed out.
•
•

•

•

•

•

•

•

•

•

•

•

•

•
•

2

Cart Drawer & Checkout Flow
Cart Page/Drawer: Displays itemized totals, variant options selected, delivery tip option (₹20, ₹30, ₹50),
and coupon code input validated against Supabase coupons table.
Multi-Step Checkout: Shipping/Delivery Address with floating label inputs → Payment choice via
integrated Razorpay Elements customized to the orange brand theme.
Order Tracking Page: Once paid, redirects to a live order status page showing an animated SVG
checkmark and a visual vertical timeline (Order Placed → Kitchen Preparing → Out for Delivery →
Delivered) updated via Supabase Realtime.
SECTION 3: FULL-STACK ADMIN PANEL ( /admin )
A completely separate, role-protected dashboard layout ( role == 'admin' in Supabase profiles).
Dashboard Overview: Recharts-powered graphs showing Total Revenue, Total Orders, Average Order
Value, and Low Stock/Ingredients alerts.
Menu Management ( /admin/menu ): Full CRUD for food items. Drag-and-drop media uploader to
Supabase Storage ( food-media ). Dynamic variant creator for sizes or toppings. Toggle dish as
"Available/Sold Out" instantly.
Live Order Manager ( /admin/orders ): A real-time table tracking pending, preparing, and dispatched
orders. Admin can update order status via a dropdown, which instantly updates the user's tracking page
via Supabase Realtime listeners.
Coupon & Campaign Manager: Create and track usage limits for promo codes (percentage or fixed
discounts).

SECTION 4: SUPABASE DATABASE SCHEMA

Generate a PostgreSQL migration file including the following tables, relations, and Row Level Security (RLS)
rules:
•

•

•

•

•

•

•

3

RLS Policies & Buckets
Public read access for food_items , categories , and reviews .
Customers can only Read/Write their own profiles , orders , and addresses .
Admin role required for all writes on food_items , categories , coupons , and orders .
Storage Buckets: Create food-media (Public read, admin write) and user-avatars (Auth user write).

SECTION 5: TECHNICAL CODE & STATE REQUIREMENTS
State Management: Cart state managed via React Context API with local storage persistence. Auth state
managed via Supabase Auth Listener context.
Performance: Next.js dynamic imports for Recharts and heavy admin components. ISR ( revalidate:
60 ) for public menu sections.
Environment Setup: Provide a .env.example containing placeholders for:
NEXT_PUBLIC_SUPABASE_URL , NEXT_PUBLIC_SUPABASE_ANON_KEY , RAZORPAY_KEY_ID ,
RAZORPAY_KEY_SECRET , and RAZORPAY_WEBHOOK_SECRET .
-- 1. PROFILES (Customers & Admins)
profiles (id uuid FK auth.users, email text, full_name text, phone text, avatar_url text, role text DEFAULT 'customer')
-- 2. CATEGORIES (Cuisines/Collections)
categories (id uuid, name text, slug text UNIQUE, image_url text, sort_order int)
-- 3. FOOD_ITEMS (Main Menu)
food_items (id uuid, name text, slug text UNIQUE, description text, category_id uuid FK, price numeric, sale_price numeric, is_veg boolean, status text DEFAULT 'active', stock_status text DEFAULT 'available', tags text[])
-- 4. FOOD_VARIANTS & ADDONS
food_options (id uuid, food_item_id uuid FK, name text)
food_option_values (id uuid, option_id uuid FK, value text, price_modifier numeric)
-- 5. ORDERS & ITEMS
orders (id uuid, order_number text UNIQUE, user_id uuid FK, delivery_address jsonb, subtotal numeric, discount numeric, delivery_charge numeric, tip numeric, total numeric, payment_status text, fulfillment_status text, razorpay_order_id text)
order_items (id uuid, order_id uuid FK, food_item_id uuid FK, title text, variant_info jsonb, quantity int, unit_price numeric, line_total numeric)
-- 6. ORDER_TIMELINE (Real-time updates)
order_timeline (id uuid, order_id uuid FK, status text, note text, created_at timestamp)
-- 7. COUPONS
coupons (id uuid, code text UNIQUE, type text, value numeric, max_uses int, times_used int, is_active boolean)

•
•
•
•

•

•

•

4

IMPLEMENTATION STEPS

Initialize Next.js 14 App Router project with TypeScript, Tailwind, and Framer Motion.
Set up Supabase Client and write the full PostgreSQL schema migration script.
Build core atomic UI components (Shimmer Buttons, Inputs, Dialogs, Toast Notifications).
Build Storefront layout (Header, Cart Drawer, Footer).
Build the Dynamic Menu and Filters system.
Build Checkout, Razorpay Integration, and Order Real-time Tracking.
Build the Admin Dashboard and Live Order Pipeline.
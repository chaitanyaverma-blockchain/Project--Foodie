-- ============================================================
-- FOODIE E-COMMERCE — FULL SUPABASE MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (Customers & Admins)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES (Cuisines / Collections)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  description TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. FOOD_ITEMS (Main Menu)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price         NUMERIC(10,2) NOT NULL,
  sale_price    NUMERIC(10,2),
  image_url     TEXT,
  is_veg        BOOLEAN NOT NULL DEFAULT TRUE,
  is_egg        BOOLEAN NOT NULL DEFAULT FALSE,
  calories      INT,
  dietary_tags  TEXT[],
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  stock_status  TEXT NOT NULL DEFAULT 'available' CHECK (stock_status IN ('available', 'sold_out')),
  rating        NUMERIC(3,2) DEFAULT 4.0,
  order_count   INT DEFAULT 0,
  tags          TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. FOOD OPTIONS & VARIANTS (Add-ons, Sizes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_options (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_item_id  UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,  -- e.g. "Size", "Toppings"
  type          TEXT NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'multiple')),
  is_required   BOOLEAN DEFAULT FALSE,
  sort_order    INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.food_option_values (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id      UUID NOT NULL REFERENCES public.food_options(id) ON DELETE CASCADE,
  value          TEXT NOT NULL,   -- e.g. "Regular", "Large", "Extra Cheese"
  price_modifier NUMERIC(10,2) DEFAULT 0,
  is_available   BOOLEAN DEFAULT TRUE,
  sort_order     INT DEFAULT 0
);

-- ============================================================
-- 5. ADDRESSES (Customer Delivery Addresses)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label       TEXT DEFAULT 'Home',
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          TEXT NOT NULL UNIQUE,
  description   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value         NUMERIC(10,2) NOT NULL,
  min_order     NUMERIC(10,2) DEFAULT 0,
  max_discount  NUMERIC(10,2),
  max_uses      INT DEFAULT 100,
  times_used    INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        TEXT NOT NULL UNIQUE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id),
  delivery_address    JSONB NOT NULL,
  subtotal            NUMERIC(10,2) NOT NULL,
  discount            NUMERIC(10,2) DEFAULT 0,
  delivery_charge     NUMERIC(10,2) DEFAULT 40,
  tip                 NUMERIC(10,2) DEFAULT 0,
  total               NUMERIC(10,2) NOT NULL,
  coupon_code         TEXT,
  payment_status      TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  fulfillment_status  TEXT NOT NULL DEFAULT 'placed' CHECK (fulfillment_status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. ORDER_ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_item_id  UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  image_url     TEXT,
  variant_info  JSONB DEFAULT '{}',
  quantity      INT NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10,2) NOT NULL,
  line_total    NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- 9. ORDER_TIMELINE (Real-time status tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_timeline (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_item_id  UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_food_items_category ON public.food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_status ON public.food_items(status, stock_status);
CREATE INDEX IF NOT EXISTS idx_food_items_rating ON public.food_items(rating DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON public.order_timeline(order_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

-- CATEGORIES — Public read, admin write
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (public.is_admin());

-- FOOD_ITEMS — Public read active items, admin write
CREATE POLICY "Public read food items" ON public.food_items FOR SELECT USING (status = 'active');
CREATE POLICY "Admin full access food items" ON public.food_items FOR ALL USING (public.is_admin());

-- FOOD_OPTIONS
CREATE POLICY "Public read food options" ON public.food_options FOR SELECT USING (TRUE);
CREATE POLICY "Admin write food options" ON public.food_options FOR ALL USING (public.is_admin());

-- FOOD_OPTION_VALUES
CREATE POLICY "Public read option values" ON public.food_option_values FOR SELECT USING (TRUE);
CREATE POLICY "Admin write option values" ON public.food_option_values FOR ALL USING (public.is_admin());

-- ADDRESSES
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- COUPONS — Public read active, admin write
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- ORDERS
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (public.is_admin());

-- ORDER_ITEMS
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Users create order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- ORDER_TIMELINE — Public read for order owners
CREATE POLICY "Users view own order timeline" ON public.order_timeline FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Admins manage timeline" ON public.order_timeline FOR ALL USING (public.is_admin());

-- REVIEWS
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users create own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('food-media', 'food-media', TRUE) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('user-avatars', 'user-avatars', FALSE) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read food media" ON storage.objects FOR SELECT USING (bucket_id = 'food-media');
CREATE POLICY "Admin upload food media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-media' AND public.is_admin());
CREATE POLICY "Admin update food media" ON storage.objects FOR UPDATE USING (bucket_id = 'food-media' AND public.is_admin());
CREATE POLICY "Admin delete food media" ON storage.objects FOR DELETE USING (bucket_id = 'food-media' AND public.is_admin());

CREATE POLICY "User upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User read own avatar" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- SEED DATA — Categories
-- ============================================================
INSERT INTO public.categories (name, slug, image_url, sort_order) VALUES
  ('North Indian', 'north-indian', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 1),
  ('South Indian', 'south-indian', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', 2),
  ('Italian', 'italian', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', 3),
  ('Chinese', 'chinese', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400', 4),
  ('Desserts', 'desserts', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 5),
  ('Healthy', 'healthy', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 6),
  ('Street Food', 'street-food', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 7),
  ('Burgers', 'burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — Sample Coupons
-- ============================================================
INSERT INTO public.coupons (code, description, type, value, min_order, max_discount, max_uses) VALUES
  ('FOODIE50', 'Get 50% off on your first order', 'percentage', 50, 200, 150, 1000),
  ('WELCOME100', 'Flat ₹100 off on orders above ₹500', 'fixed', 100, 500, 100, 500),
  ('FEAST20', '20% off on all orders', 'percentage', 20, 100, 80, 2000)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ENABLE REALTIME on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_timeline;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

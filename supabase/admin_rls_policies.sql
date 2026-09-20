-- ============================================================
-- FOODIE ADMIN — RLS POLICIES
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- food_items: Admin full CRUD
DROP POLICY IF EXISTS "Admin full access food_items" ON food_items;
CREATE POLICY "Admin full access food_items" ON food_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow all authenticated users to SELECT food_items (for the menu page)
DROP POLICY IF EXISTS "Public read food_items" ON food_items;
CREATE POLICY "Public read food_items" ON food_items
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- food_options: Admin full CRUD
DROP POLICY IF EXISTS "Admin full access food_options" ON food_options;
CREATE POLICY "Admin full access food_options" ON food_options
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- food_option_values: Admin full CRUD
DROP POLICY IF EXISTS "Admin full access food_option_values" ON food_option_values;
CREATE POLICY "Admin full access food_option_values" ON food_option_values
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- categories: Admin full CRUD
DROP POLICY IF EXISTS "Admin full access categories" ON categories;
CREATE POLICY "Admin full access categories" ON categories
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- coupons: Admin full CRUD
DROP POLICY IF EXISTS "Admin full access coupons" ON coupons;
CREATE POLICY "Admin full access coupons" ON coupons
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- orders: Admin can read and update all orders
DROP POLICY IF EXISTS "Admin full access orders" ON orders;
CREATE POLICY "Admin full access orders" ON orders
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage: Allow admin to upload to food-media bucket
-- Go to Supabase → Storage → food-media → Policies and add:
-- INSERT policy: (auth.role() = 'authenticated') AND 
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')

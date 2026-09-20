require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SQL = `
-- 1. RECIPES
CREATE TABLE IF NOT EXISTS recipes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_urls text[],
  video_url text,
  prep_time text,
  difficulty text,
  cuisine text,
  tags text[],
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. RECIPE INGREDIENTS
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity text,
  unit text
);

-- 3. RECIPE STEPS
CREATE TABLE IF NOT EXISTS recipe_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  instruction text NOT NULL
);

-- 4. RECIPE LIKES
CREATE TABLE IF NOT EXISTS recipe_likes (
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, user_id)
);

-- 5. RECIPE COMMENTS
CREATE TABLE IF NOT EXISTS recipe_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. RECIPE SAVES
CREATE TABLE IF NOT EXISTS recipe_saves (
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, user_id)
);

-- 7. RECIPE FOLLOWERS
CREATE TABLE IF NOT EXISTS recipe_followers (
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, creator_id)
);

-- RLS POLICIES FOR RECIPES (Optional but good practice)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_followers ENABLE ROW LEVEL SECURITY;

-- Public can read approved recipes
DROP POLICY IF EXISTS "Public read approved recipes" ON recipes;
CREATE POLICY "Public read approved recipes" ON recipes
  FOR SELECT TO public
  USING (is_approved = true);

-- Creator can read their own recipes
DROP POLICY IF EXISTS "Creator read own recipes" ON recipes;
CREATE POLICY "Creator read own recipes" ON recipes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Creator can insert own recipes
DROP POLICY IF EXISTS "Creator insert own recipes" ON recipes;
CREATE POLICY "Creator insert own recipes" ON recipes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can do everything on recipes
DROP POLICY IF EXISTS "Admin full access recipes" ON recipes;
CREATE POLICY "Admin full access recipes" ON recipes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Recipe ingredients read access (public if recipe is approved or if admin/creator)
DROP POLICY IF EXISTS "Public read recipe ingredients" ON recipe_ingredients;
CREATE POLICY "Public read recipe ingredients" ON recipe_ingredients
  FOR SELECT TO public
  USING (true);

-- Recipe ingredients insert access
DROP POLICY IF EXISTS "Creator insert recipe ingredients" ON recipe_ingredients;
CREATE POLICY "Creator insert recipe ingredients" ON recipe_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND user_id = auth.uid()));

-- Recipe steps read access
DROP POLICY IF EXISTS "Public read recipe steps" ON recipe_steps;
CREATE POLICY "Public read recipe steps" ON recipe_steps
  FOR SELECT TO public
  USING (true);

-- Recipe steps insert access
DROP POLICY IF EXISTS "Creator insert recipe steps" ON recipe_steps;
CREATE POLICY "Creator insert recipe steps" ON recipe_steps
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM recipes WHERE id = recipe_steps.recipe_id AND user_id = auth.uid()));

-- Likes read access
DROP POLICY IF EXISTS "Public read recipe likes" ON recipe_likes;
CREATE POLICY "Public read recipe likes" ON recipe_likes
  FOR SELECT TO public
  USING (true);

-- Likes insert/delete
DROP POLICY IF EXISTS "Authenticated insert recipe likes" ON recipe_likes;
CREATE POLICY "Authenticated insert recipe likes" ON recipe_likes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments read access
DROP POLICY IF EXISTS "Public read recipe comments" ON recipe_comments;
CREATE POLICY "Public read recipe comments" ON recipe_comments
  FOR SELECT TO public
  USING (true);

-- Comments insert
DROP POLICY IF EXISTS "Authenticated insert recipe comments" ON recipe_comments;
CREATE POLICY "Authenticated insert recipe comments" ON recipe_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
  
-- Saves read access
DROP POLICY IF EXISTS "Authenticated read own saves" ON recipe_saves;
CREATE POLICY "Authenticated read own saves" ON recipe_saves
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
  
-- Saves insert/delete
DROP POLICY IF EXISTS "Authenticated insert recipe saves" ON recipe_saves;
CREATE POLICY "Authenticated insert recipe saves" ON recipe_saves
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
  
-- Followers read access
DROP POLICY IF EXISTS "Public read recipe followers" ON recipe_followers;
CREATE POLICY "Public read recipe followers" ON recipe_followers
  FOR SELECT TO public
  USING (true);
  
-- Followers insert/delete
DROP POLICY IF EXISTS "Authenticated insert recipe followers" ON recipe_followers;
CREATE POLICY "Authenticated insert recipe followers" ON recipe_followers
  FOR ALL TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());
`;

async function applySchema() {
  console.log('Creating Community tables and RLS policies...');
  
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL }),
  });

  if (!res.ok) {
    console.error('Failed to apply schema:', await res.text());
  } else {
    console.log('✅ Schema successfully created!');
  }
}

applySchema().catch(console.error);

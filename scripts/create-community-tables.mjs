import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bugfbqjrqawtkwptgfzu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Z2ZicWpycWF3dGt3cHRnZnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3Njk0OCwiZXhwIjoyMDk4NzUyOTQ4fQ.D6y91Ts0WUmOIfoeMt0x_wAU9uxZQL7j5vSQw5yehF4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const sql = `
-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  prep_time text,
  difficulty text DEFAULT 'Medium',
  cuisine text,
  tags text[] DEFAULT '{}',
  image_urls text[] DEFAULT '{}',
  video_url text,
  is_approved boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity text,
  unit text,
  created_at timestamptz DEFAULT now()
);

-- Create recipe_steps table
CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  instruction text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create recipe_likes table (for tracking likes)
CREATE TABLE IF NOT EXISTS public.recipe_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
DROP POLICY IF EXISTS "Public can view approved recipes" ON public.recipes;
CREATE POLICY "Public can view approved recipes"
  ON public.recipes FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
CREATE POLICY "Users can view their own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert recipes" ON public.recipes;
CREATE POLICY "Authenticated users can insert recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for recipe_ingredients
DROP POLICY IF EXISTS "Public can view ingredients of approved recipes" ON public.recipe_ingredients;
CREATE POLICY "Public can view ingredients of approved recipes"
  ON public.recipe_ingredients FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.is_approved = true OR r.user_id = auth.uid())));

DROP POLICY IF EXISTS "Authenticated users can insert ingredients" ON public.recipe_ingredients;
CREATE POLICY "Authenticated users can insert ingredients"
  ON public.recipe_ingredients FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND r.user_id = auth.uid()));

-- RLS Policies for recipe_steps
DROP POLICY IF EXISTS "Public can view steps of approved recipes" ON public.recipe_steps;
CREATE POLICY "Public can view steps of approved recipes"
  ON public.recipe_steps FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.is_approved = true OR r.user_id = auth.uid())));

DROP POLICY IF EXISTS "Authenticated users can insert steps" ON public.recipe_steps;
CREATE POLICY "Authenticated users can insert steps"
  ON public.recipe_steps FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND r.user_id = auth.uid()));

-- RLS Policies for recipe_likes
DROP POLICY IF EXISTS "Public can view likes" ON public.recipe_likes;
CREATE POLICY "Public can view likes"
  ON public.recipe_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like recipes" ON public.recipe_likes;
CREATE POLICY "Authenticated users can like recipes"
  ON public.recipe_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike recipes" ON public.recipe_likes;
CREATE POLICY "Users can unlike recipes"
  ON public.recipe_likes FOR DELETE
  USING (auth.uid() = user_id);
`;

async function runMigration() {
  console.log('🚀 Creating community tables in Supabase...\n');

  const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: { message: 'rpc not available' } }));

  if (error) {
    // Fall back to running statements individually via the REST API
    console.log('Running SQL via direct query...');
    
    // Split into individual statements and run each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0;
    let failed = 0;

    for (const statement of statements) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({ sql: statement + ';' }),
        });

        if (!response.ok) {
          const err = await response.text();
          // Ignore "already exists" errors
          if (!err.includes('already exists') && !err.includes('duplicate')) {
            console.warn(`⚠️  Statement warning: ${err.substring(0, 100)}`);
            failed++;
          } else {
            success++;
          }
        } else {
          success++;
        }
      } catch (e) {
        failed++;
        console.error(`Error: ${e.message}`);
      }
    }

    console.log(`\nCompleted: ${success} succeeded, ${failed} issues`);
  } else {
    console.log('✅ Migration completed successfully!');
  }

  // Verify tables exist
  console.log('\n🔍 Verifying tables...');
  
  const tables = ['recipes', 'recipe_ingredients', 'recipe_steps', 'recipe_likes'];
  for (const table of tables) {
    const { error: checkError } = await supabase.from(table).select('id').limit(1);
    if (checkError && checkError.code === '42P01') {
      console.log(`❌ Table '${table}' - NOT FOUND`);
    } else {
      console.log(`✅ Table '${table}' - OK`);
    }
  }
}

runMigration().catch(console.error);

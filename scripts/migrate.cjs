const { Client } = require('pg');

// Supabase project details
const PROJECT_REF = 'bugfbqjrqawtkwptgfzu';
// The DB password for Supabase is the service role key JWT
// Connection via Supabase's connection pooler (Transaction mode, port 6543)
// Username format for pooler: postgres.PROJECT_REF
// Password: your database password (set when you created the project)
// We try the service role key as password (sometimes works) and multiple hosts

async function tryConnect(config, label) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log(`✅ Connected via ${label}`);
    return client;
  } catch (e) {
    console.log(`❌ Failed ${label}: ${e.message.substring(0, 100)}`);
    return null;
  }
}

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Z2ZicWpycWF3dGt3cHRnZnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3Njk0OCwiZXhwIjoyMDk4NzUyOTQ4fQ.D6y91Ts0WUmOIfoeMt0x_wAU9uxZQL7j5vSQw5yehF4';

const SQL = `
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

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity text,
  unit text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  instruction text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipes' AND policyname='Public can view approved recipes') THEN
    CREATE POLICY "Public can view approved recipes" ON public.recipes FOR SELECT USING (is_approved = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipes' AND policyname='Users can view their own recipes') THEN
    CREATE POLICY "Users can view their own recipes" ON public.recipes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipes' AND policyname='Authenticated users can insert recipes') THEN
    CREATE POLICY "Authenticated users can insert recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_ingredients' AND policyname='Anyone can view ingredients') THEN
    CREATE POLICY "Anyone can view ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_ingredients' AND policyname='Anyone can insert ingredients') THEN
    CREATE POLICY "Anyone can insert ingredients" ON public.recipe_ingredients FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_steps' AND policyname='Anyone can view steps') THEN
    CREATE POLICY "Anyone can view steps" ON public.recipe_steps FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_steps' AND policyname='Anyone can insert steps') THEN
    CREATE POLICY "Anyone can insert steps" ON public.recipe_steps FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_likes' AND policyname='Public can view likes') THEN
    CREATE POLICY "Public can view likes" ON public.recipe_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_likes' AND policyname='Users can manage likes') THEN
    CREATE POLICY "Users can manage likes" ON public.recipe_likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_comments' AND policyname='Public can view comments') THEN
    CREATE POLICY "Public can view comments" ON public.recipe_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recipe_comments' AND policyname='Users can insert comments') THEN
    CREATE POLICY "Users can insert comments" ON public.recipe_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
`;

async function main() {
  console.log('Attempting to connect to Supabase PostgreSQL...\n');
  
  // Try the direct DB host (port 5432)
  const directConfig = {
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  };

  // Try Supabase pooler (port 6543, transaction mode)
  const poolerConfig = {
    host: `aws-0-ap-south-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  };

  let client = await tryConnect(directConfig, 'Direct DB (5432)');
  if (!client) {
    client = await tryConnect(poolerConfig, 'Pooler AP-South-1 (6543)');
  }
  
  // Try other regions
  const regions = ['us-east-1', 'us-west-1', 'eu-central-1', 'ap-southeast-1'];
  for (const region of regions) {
    if (client) break;
    client = await tryConnect({
      ...poolerConfig,
      host: `aws-0-${region}.pooler.supabase.com`,
    }, `Pooler ${region}`);
  }

  if (!client) {
    console.log('\n❌ Could not connect to Supabase PostgreSQL.');
    console.log('\nThe database password is NOT the service role key.');
    console.log('To find your database password:');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/database');
    console.log('2. Look for "Database Password" and copy it');
    console.log('3. Run: node scripts/migrate-with-password.cjs YOUR_DB_PASSWORD');
    return;
  }

  try {
    console.log('\nRunning SQL migration...');
    await client.query(SQL);
    console.log('\n✅ SUCCESS! All community tables created.');
    console.log('Tables created: recipes, recipe_ingredients, recipe_steps, recipe_likes, recipe_comments');
  } catch (e) {
    console.error('\n❌ SQL Error:', e.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);

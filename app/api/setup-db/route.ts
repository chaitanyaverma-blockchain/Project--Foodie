import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: Record<string, string> = {};

  // We create tables by making direct SQL calls to the Postgres endpoint
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  async function runSQL(label: string, sql: string) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
        },
        body: JSON.stringify({ sql }),
      });
      const text = await res.text();
      results[label] = res.ok ? 'OK' : `ERROR: ${text.substring(0, 200)}`;
    } catch (e: any) {
      results[label] = `EXCEPTION: ${e.message}`;
    }
  }

  // Try using the pg_query endpoint available in Supabase
  async function runSQLDirect(label: string, sql: string) {
    try {
      const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];
      const res = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
        },
        body: JSON.stringify({ query: sql }),
      });
      const text = await res.text();
      results[label] = res.ok ? 'OK' : `${res.status}: ${text.substring(0, 200)}`;
    } catch (e: any) {
      results[label] = `EXCEPTION: ${e.message}`;
    }
  }

  // Try the Management API approach
  async function runSQLMgmt(label: string, sql: string, accessToken: string) {
    try {
      const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];
      const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      const text = await res.text();
      results[label] = res.ok ? 'OK' : `${res.status}: ${text.substring(0, 200)}`;
    } catch (e: any) {
      results[label] = `EXCEPTION: ${e.message}`;
    }
  }

  // First, check current table state
  const tableChecks: Record<string, boolean> = {};
  for (const table of ['recipes', 'recipe_ingredients', 'recipe_steps', 'recipe_likes']) {
    const { error } = await supabaseAdmin.from(table).select('id').limit(1);
    tableChecks[table] = !error || error.code !== 'PGRST205';
  }
  results['existing_tables'] = JSON.stringify(tableChecks);

  // Try all SQL endpoints
  const createSQL = `
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
    ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;
  `;

  await runSQL('rpc_exec_sql', createSQL);
  await runSQLDirect('pg_query', createSQL);

  return NextResponse.json({
    message: 'Setup attempted. Check results.',
    results,
    instructions: 'If all methods failed, please run the SQL manually in your Supabase Dashboard at: https://supabase.com/dashboard/project/bugfbqjrqawtkwptgfzu/sql/new'
  });
}

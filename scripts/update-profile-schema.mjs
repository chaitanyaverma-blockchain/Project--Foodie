import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Updating Database Schema for Profile Redesign...');

  const sql = `
-- Update profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS trophies integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS social_links jsonb,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS favorite_cuisine text;

-- Create achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create activity timeline
CREATE TABLE IF NOT EXISTS activity_timeline (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read user achievements" ON user_achievements;
CREATE POLICY "Public read user achievements" ON user_achievements FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Auth insert user achievements" ON user_achievements;
CREATE POLICY "Auth insert user achievements" ON user_achievements FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

ALTER TABLE activity_timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read activity timeline" ON activity_timeline;
CREATE POLICY "Public read activity timeline" ON activity_timeline FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Auth insert activity timeline" ON activity_timeline;
CREATE POLICY "Auth insert activity timeline" ON activity_timeline FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());
  `;

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    console.error('Failed to apply schema:', await res.text());
  } else {
    console.log('✅ Schema successfully updated!');
  }
}

run();

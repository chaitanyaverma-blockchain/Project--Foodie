require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// SQL policies to allow admin users full CRUD on all admin tables
const POLICIES = [
  // food_items
  `DROP POLICY IF EXISTS "Admin full access food_items" ON food_items;`,
  `CREATE POLICY "Admin full access food_items" ON food_items
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`,

  // food_options
  `DROP POLICY IF EXISTS "Admin full access food_options" ON food_options;`,
  `CREATE POLICY "Admin full access food_options" ON food_options
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`,

  // food_option_values
  `DROP POLICY IF EXISTS "Admin full access food_option_values" ON food_option_values;`,
  `CREATE POLICY "Admin full access food_option_values" ON food_option_values
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`,

  // categories
  `DROP POLICY IF EXISTS "Admin full access categories" ON categories;`,
  `CREATE POLICY "Admin full access categories" ON categories
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`,

  // coupons
  `DROP POLICY IF EXISTS "Admin full access coupons" ON coupons;`,
  `CREATE POLICY "Admin full access coupons" ON coupons
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`,

  // orders - admin can read and update all orders
  `DROP POLICY IF EXISTS "Admin full access orders" ON orders;`,
  `CREATE POLICY "Admin full access orders" ON orders
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`,

  // profiles - admin can read all profiles
  `DROP POLICY IF EXISTS "Admin read all profiles" ON profiles;`,
  `CREATE POLICY "Admin read all profiles" ON profiles
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));`,
];

async function applyPolicies() {
  console.log('Applying RLS policies for admin access...\n');
  let successCount = 0;
  let errorCount = 0;

  for (const sql of POLICIES) {
    const shortSql = sql.slice(0, 60).replace(/\n/g, ' ') + '...';
    const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: { message: 'rpc not available' } }));

    // Try direct postgres execution via REST
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (!res.ok) {
      // Try the pg endpoint
      console.log(`⚠️  Cannot apply via RPC: "${shortSql}"`);
      errorCount++;
    } else {
      console.log(`✅ Applied: "${shortSql}"`);
      successCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} applied, ${errorCount} failed`);
  if (errorCount > 0) {
    console.log('\n⚠️  Some policies could not be applied via script.');
    console.log('Please run the following SQL in Supabase Dashboard → SQL Editor:\n');
    console.log('-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR:');
    console.log('-- https://app.supabase.com → Your Project → SQL Editor\n');
    POLICIES.forEach(p => console.log(p + '\n'));
  }
}

applyPolicies().catch(console.error);

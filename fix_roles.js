require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixRoles() {
  // Demote 'jogender' (donandrew06@gmail.com) back to customer
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'customer' })
    .eq('full_name', 'jogender')
    .select('id, email, full_name, role');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No user found with full_name = jogender');
  } else {
    console.log('✅ Demoted to customer:');
    console.table(data);
  }

  // Verify final state
  const { data: all } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .order('created_at');
  console.log('\n📋 Final profiles table:');
  console.table(all);
}

fixRoles().catch(console.error);

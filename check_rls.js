require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkAndFixRLS() {
  console.log('Testing food_items INSERT with service role...');

  const testPayload = {
    name: 'TEST_ITEM_DELETE_ME',
    slug: 'test-item-delete-me-' + Date.now(),
    description: 'Test item',
    price: 99,
    is_veg: true,
    is_egg: false,
    status: 'inactive',
    stock_status: 'available',
    rating: 0,
    order_count: 0,
    tags: [],
  };

  const { data, error } = await supabase
    .from('food_items')
    .insert(testPayload)
    .select()
    .single();

  if (error) {
    console.error('❌ INSERT failed:', error.message, error.code);
    console.log('\nThe food_items table may have RLS blocking INSERT.');
    console.log('Check Supabase Dashboard → Authentication → Policies → food_items');
  } else {
    console.log('✅ INSERT works! Test item created with id:', data.id);
    // Clean up
    await supabase.from('food_items').delete().eq('id', data.id);
    console.log('✅ Test item cleaned up.');
    console.log('\nThe food_items INSERT works via service role.');
    console.log('If admin UI still fails, it may be an RLS issue with the anon/user role.');
    console.log('Make sure a Supabase policy allows INSERT for users where their profile.role = admin');
  }

  // Also check categories
  const { data: cats, error: catErr } = await supabase.from('categories').select('id, name').limit(5);
  if (catErr) console.error('❌ Categories fetch failed:', catErr.message);
  else console.log('\n📋 Categories available:', cats.map(c => c.name));
}

checkAndFixRLS().catch(console.error);

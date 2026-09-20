require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCategory() {
  const newCategory = {
    name: 'Drinks',
    slug: 'drinks',
    description: 'Refreshing beverages, shakes, and mocktails.',
    sort_order: 10,
    is_active: true
  };

  const { data, error } = await supabase
    .from('categories')
    .insert([newCategory])
    .select();

  if (error) {
    console.error('Error adding category:', error.message);
  } else {
    console.log('Successfully added category:', data);
  }
}

addCategory().catch(console.error);

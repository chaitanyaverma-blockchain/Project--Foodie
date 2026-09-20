require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategory() {
  const { data, error } = await supabase
    .from('categories')
    .update({ image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&q=80' })
    .eq('slug', 'drinks')
    .select();

  if (error) {
    console.error('Error updating category:', error.message);
  } else {
    console.log('Successfully updated category:', data);
  }
}

updateCategory().catch(console.error);

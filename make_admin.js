require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin() {
  const email = 'dongandrew08@gmail.com';
  console.log(`Setting role to admin for ${email}...`);

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error updating profile:', error.message);
  } else if (data && data.length > 0) {
    console.log(`Successfully updated role to '${data[0].role}' for user ${data[0].email}.`);
  } else {
    console.log(`No user found with email ${email}`);
  }
}

makeAdmin().catch(console.error);

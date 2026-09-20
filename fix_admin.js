require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'dongandrew06@gmail.com';

async function fixAdmin() {
  // 1. Look up the user in auth.users via admin API
  console.log(`Looking up user: ${TARGET_EMAIL}`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }

  const user = users.find(u => u.email === TARGET_EMAIL);
  if (!user) {
    console.error(`No auth user found with email: ${TARGET_EMAIL}`);
    console.log('Registered users:', users.map(u => u.email));
    process.exit(1);
  }

  console.log(`Found auth user: id=${user.id}, email=${user.email}`);

  // 2. Upsert profile with admin role
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      role: 'admin',
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error upserting profile:', error.message);
    process.exit(1);
  }

  console.log('✅ Successfully set role to admin:');
  console.table(data);
}

fixAdmin().catch(console.error);

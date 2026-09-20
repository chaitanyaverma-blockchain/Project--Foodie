require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function setupStorage() {
  console.log('Checking storage buckets...');

  // List existing buckets
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) { console.error('Error listing buckets:', listErr.message); process.exit(1); }

  console.log('Existing buckets:', buckets.map(b => b.name));

  const bucketName = 'food-media';
  const exists = buckets.some(b => b.name === bucketName);

  if (exists) {
    console.log(`✅ Bucket "${bucketName}" already exists.`);
    // Make sure it's public
    const { error: updateErr } = await supabase.storage.updateBucket(bucketName, { public: true });
    if (updateErr) console.warn('Could not update bucket:', updateErr.message);
    else console.log(`✅ Ensured bucket "${bucketName}" is public.`);
  } else {
    console.log(`Creating bucket "${bucketName}"...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    if (error) {
      console.error('Error creating bucket:', error.message);
      process.exit(1);
    }
    console.log('✅ Bucket created:', data);
  }

  // Test write access
  const testFile = Buffer.from('test');
  const { error: uploadErr } = await supabase.storage
    .from(bucketName)
    .upload('_test_.txt', testFile, { upsert: true });

  if (uploadErr) {
    console.warn('⚠️ Upload test failed (RLS policy may restrict):', uploadErr.message);
    console.log('\n⚠️  ACTION NEEDED: Go to Supabase Dashboard → Storage → food-media → Policies');
    console.log('   Add a policy: Allow INSERT for authenticated users (role = admin)');
  } else {
    // Clean up test file
    await supabase.storage.from(bucketName).remove(['_test_.txt']);
    console.log('✅ Upload test passed! Storage is ready.');
  }
}

setupStorage().catch(console.error);

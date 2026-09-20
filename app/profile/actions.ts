'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function uploadAvatarAction(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided' };

  // Verify the user is authenticated
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const ext = file.name.split('.').pop();
  const fileName = `${user.id}.${ext}`;

  // Use service role to bypass RLS for the storage upload
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminSupabase.storage
    .from('user-avatars')
    .upload(fileName, file, { upsert: true });

  if (error) {
    return { error: error.message };
  }

  const { data: urlData } = adminSupabase.storage
    .from('user-avatars')
    .getPublicUrl(data.path);

  // Update profile avatar URL
  await adminSupabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id);

  return { url: urlData.publicUrl };
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const response = NextResponse.redirect(new URL(next, requestUrl.origin));
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (session?.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();
        
      if (!profile) {
        // Create profile for first time Google login
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
        const avatarUrl = session.user.user_metadata?.avatar_url || null;
        
        await supabase.from('profiles').insert({
          id: session.user.id,
          full_name: fullName,
          email: session.user.email,
          avatar_url: avatarUrl,
          role: 'customer' // default role
        });
      }
    }
    
    return response;
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

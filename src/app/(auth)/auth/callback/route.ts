import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (data?.user && !error) {
      // Create a profile for the new user if it doesn't exist
      const serviceClient = createServiceClient();
      
      // Check if profile already exists
      const { data: existingProfile } = await serviceClient
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (!existingProfile) {
        // Create profile similar to auth-form.tsx
        await serviceClient.from('profiles').insert({
          id: data.user.id,
          username: data.user.email?.split('@')[0] || `user-${Date.now()}`, // Default username from email
          display_name: null,
          user_type: 'student', // Default user type
          avatar_url: null,
        });
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

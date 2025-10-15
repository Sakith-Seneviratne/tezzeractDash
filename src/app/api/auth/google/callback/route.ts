import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=google_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Get user info to verify the token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    const userData = await userResponse.json();

    // Get organization from session
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    // Get user's current organization
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!memberData) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup/organization`);
    }

    // Save the integration
    const { error: insertError } = await supabase
      .from('data_streams')
      .insert({
        organization_id: memberData.organization_id,
        platform_type: 'google_analytics',
        name: 'Google Analytics',
        config: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in ? Date.now() / 1000 + tokenData.expires_in : undefined,
          user_id: userData.id,
          user_name: userData.name,
          user_email: userData.email,
        },
        status: 'active',
      });

    if (insertError) {
      console.error('Error saving Google Analytics integration:', insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=save_failed`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?success=google_connected`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=callback_failed`);
  }
}

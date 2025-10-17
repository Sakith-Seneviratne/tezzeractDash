import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Meta OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=meta_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Meta token exchange error:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    console.log('Meta token received:', { expires_in: tokenData.expires_in, has_long_lived: !!tokenData.access_token });
    
    // Get user info to verify the token
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${tokenData.access_token}`);
    const userData = await userResponse.json();
    console.log('Meta user data:', userData);

    // Store tokens in localStorage via URL parameters (similar to LinkedIn/Google)
    const tokens = {
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      user_id: userData.id,
      user_name: userData.name,
    };

    // Redirect to setup page with tokens
    const tokensParam = encodeURIComponent(JSON.stringify(tokens));
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?success=meta_connected&tokens=${tokensParam}`);
  } catch (error) {
    console.error('Meta OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/setup?error=callback_failed`);
  }
}

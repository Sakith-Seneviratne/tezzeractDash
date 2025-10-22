import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not configured. Returning null client.');
    return null;
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (error) {
    console.warn('Invalid Supabase URL format:', supabaseUrl);
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

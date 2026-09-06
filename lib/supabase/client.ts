import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for client-side React components.
 * Safely uses the public Anon Key and handles cookies in the browser.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

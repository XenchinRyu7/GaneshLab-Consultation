import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const SUPABASE_URL: string = supabaseUrl;
const SUPABASE_ANON_KEY: string = supabaseAnonKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    // Disable logging to prevent console errors
    log_level: "error" as const,
  },
  // Global options
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function createServerSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

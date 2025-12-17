import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

// Prefer service role key on the server. Fallback to anon for dev.
const serverKey = serviceRoleKey || anonKey;
if (!serverKey) {
  throw new Error(
    "Missing Supabase server key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  );
}

export const supabaseServer = createClient(supabaseUrl, serverKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

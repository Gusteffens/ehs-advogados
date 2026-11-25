import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Public Supabase client for read-only server usage.
 * Keeps public pages away from auth cookies and the service role key.
 */
export function hasPublicSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function createPublicClient() {
  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

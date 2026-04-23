import { createClient } from "@supabase/supabase-js";

/**
 * Public Supabase client for read-only server usage.
 * This keeps public pages away from auth cookies and the service role key.
 */
export function hasPublicSupabaseEnv() {
    return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export function createPublicClient() {
    if (!hasPublicSupabaseEnv()) {
        return null;
    }

    return createClient(
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

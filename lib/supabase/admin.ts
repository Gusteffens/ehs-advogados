import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with service role key.
 * Use ONLY in server-side code (API routes, webhooks, server actions).
 * This bypasses Row Level Security.
 */
export function createAdminClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is required to initialize Admin Client')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to initialize Admin Client')
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );
}

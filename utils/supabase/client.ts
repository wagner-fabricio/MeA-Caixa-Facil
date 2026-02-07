import { createBrowserClient } from '@supabase/ssr'

// Basic client creation for client-side usage
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback for build time if envs are missing
    if (!supabaseUrl || !supabaseKey) {
        if (typeof window === 'undefined') {
            // Server-side/Build-time fallback - returns a dummy client that doesn't crash but won't work for real calls
            return { auth: { resetPasswordForEmail: async () => ({ error: null }) } } as any
        }
        console.error('Missing Supabase environment variables')
    }

    return createBrowserClient(
        supabaseUrl || '',
        supabaseKey || ''
    )
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Whether the Supabase credentials exist in this environment.
 *
 * `createClient()` throws when they don't — `createServerClient` rejects an
 * undefined URL/key outright. Production is currently built WITHOUT them (the
 * live `connect-src` CSP directive, which is assembled from
 * NEXT_PUBLIC_SUPABASE_URL in next.config.ts, carries no Supabase origin), so
 * every page that called `createClient()` in its body returned a 500:
 * `/forum` — which is in sitemap.xml and indexable — and `/profile`.
 *
 * `app/api/auth-status/route.ts` already guarded this way; the pages did not.
 * Callers must check before constructing a client so the account-less parts of
 * a page still render.
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

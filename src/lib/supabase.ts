import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional in Phase 1 (static content + search UI).
 * Wire NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY for
 * auth, saved searches, and forum in Phase 2.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export type ForumThread = {
  id: string;
  title: string;
  pillar: string | null;
  created_at: string;
};

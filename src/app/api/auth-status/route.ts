import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const unavailable = () => NextResponse.json(
  { authenticated: false },
  { headers: { "Cache-Control": "private, no-store, max-age=0" } },
);

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return unavailable();
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return NextResponse.json(
    { authenticated: !error && Boolean(data.user) },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function DELETE() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return unavailable();
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  return unavailable();
}

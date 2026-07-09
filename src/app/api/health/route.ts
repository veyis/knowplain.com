import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "knowplain-web",
    supabaseConfigured: Boolean(getSupabase()),
  });
}

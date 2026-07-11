"use server";

import { createClient } from "@/lib/supabase/server";

export async function captureCheckupLead(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  if (!email || !email.includes("@")) return { ok: false, error: "Enter a valid email." };

  try {
    const supabase = await createClient();
    await supabase.from("knowplain_leads").insert({
      email,
      source: "retirement_checkup",
      notes: summary,
    });
  } catch {
    // The lead table may not exist in local/dev yet. Keep the UX useful.
  }

  return { ok: true };
}


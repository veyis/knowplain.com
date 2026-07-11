"use server";

import { createClient } from "@/lib/supabase/server";
import { sendCheckupSummary } from "@/lib/email";

/**
 * Stores the email, then tries to send the summary.
 *
 * Returns `sent` separately from `ok` so the UI can only claim what actually happened.
 * If Resend isn't configured the lead is still captured and `sent` is false — we say
 * "saved", not "sent". Storage failures are surfaced, never swallowed: telling a user
 * we saved something we dropped is the one thing a trust-led site cannot do.
 *
 * `summary` is the checkup's generic verdict sentence. It carries no balances, income,
 * or debt — those never leave the browser.
 */
export async function captureCheckupLead(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  if (!email || !email.includes("@")) return { ok: false, sent: false, error: "Enter a valid email." };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("knowplain_leads")
      .upsert(
        { email, source: "retirement_checkup", notes: summary },
        { onConflict: "email,source", ignoreDuplicates: true },
      );
    if (error) return { ok: false, sent: false, error: "We could not save that. Please try again." };
  } catch {
    return { ok: false, sent: false, error: "We could not save that. Please try again." };
  }

  const sent = await sendCheckupSummary(email, summary);
  return { ok: true, sent };
}

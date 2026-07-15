"use server";

import { createClient } from "@/lib/supabase/server";
import { sendCheckupSummary } from "@/lib/email";
import { isCheckupInput } from "@/lib/checkup-storage";
import { CHECKUP_SUMMARIES, runRetirementCheckup } from "@/lib/checkup";
import { checkupResumePath } from "@/lib/checkup-resume";
import { site } from "@/lib/site";

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
  if (!Object.values(CHECKUP_SUMMARIES).includes(summary as (typeof CHECKUP_SUMMARIES)[keyof typeof CHECKUP_SUMMARIES])) {
    return { ok: false, sent: false, error: "That summary could not be validated." };
  }

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

export async function saveCheckupToAccount(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const rawInput = String(formData.get("input") || "");
  if (!name || name.length > 48) {
    return { ok: false, requiresAuth: false, error: "Use a name between 1 and 48 characters." };
  }
  if (!rawInput || rawInput.length > 4096) {
    return { ok: false, requiresAuth: false, error: "That scenario could not be validated." };
  }

  let input: unknown;
  try {
    input = JSON.parse(rawInput);
  } catch {
    return { ok: false, requiresAuth: false, error: "That scenario could not be validated." };
  }
  if (!isCheckupInput(input)) {
    return { ok: false, requiresAuth: false, error: "That scenario contains an invalid value." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, requiresAuth: true, error: "Sign in to save across devices." };

    const { data, error } = await supabase.from("knowplain_saved_checkups").insert({
      user_id: user.id,
      name,
      input,
    }).select("id").single();
    if (error || !data) return { ok: false, requiresAuth: false, error: "We could not save that scenario." };

    const resumePath = checkupResumePath(data.id);
    if (!resumePath) return { ok: false, requiresAuth: false, error: "We could not create a secure resume link." };
    const emailed = user.email
      ? await sendCheckupSummary(
          user.email,
          runRetirementCheckup(input).summary,
          { resumeUrl: `${site.url}${resumePath}` },
        )
      : false;
    return { ok: true, requiresAuth: false, resumePath, emailed };
  } catch {
    return { ok: false, requiresAuth: false, error: "We could not save that scenario." };
  }
}

/**
 * Forward a captured lead to PxlPeak so someone actually hears about it.
 *
 * Checkup leads land in the `knowplain_leads` table and stopped there: no admin
 * page reads it, no alert fires on insert, and RLS blocks the anon key from
 * selecting it. Leads accumulated where nobody would ever see them. PxlPeak
 * stores the lead against knowplain.com, scores it, and emails the recipients
 * configured on the site record — the same path the rest of the portfolio uses.
 *
 * Never throws. The Supabase insert stays the source of truth, so a notification
 * failure must not turn a saved lead into an error for the visitor.
 */

const TIMEOUT_MS = 10_000;

export async function notifyPxlPeak(input: {
  email: string;
  message: string;
  source: string;
}): Promise<void> {
  const apiUrl = process.env.PXLPEAK_API_URL;
  const apiKey = process.env.PXLPEAK_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn("[pxlpeak] PXLPEAK_API_URL/PXLPEAK_API_KEY unset — nobody was notified");
    return;
  }

  try {
    const resp = await fetch(`${apiUrl}/api/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: input.email.split("@")[0],
        email: input.email,
        message: input.message,
        source: input.source,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "unknown");
      console.error(`[pxlpeak] rejected the lead: ${resp.status}`, detail);
    }
  } catch (error) {
    console.error("[pxlpeak] notification failed:", error);
  }
}

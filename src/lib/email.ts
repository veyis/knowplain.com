import "server-only";
import { Resend } from "resend";

/**
 * Transactional email for checkup results.
 *
 * Fails SAFE and fails HONEST: if Resend is not configured, or the send fails, this
 * returns false and the caller must not tell the user an email is on the way. The
 * lead is still stored, so nothing is lost — we simply don't claim what didn't happen.
 *
 * CAN-SPAM: every message carries a working opt-out and a physical postal address.
 * The moment this email carries an affiliate link or an advisor CTA its primary purpose
 * becomes commercial, so we comply as if it already does — it costs nothing.
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM; // e.g. "Know Plain <hello@knowplain.com>"
const contactEmail = process.env.KNOWPLAIN_CONTACT_EMAIL;
const postalAddress = process.env.KNOWPLAIN_POSTAL_ADDRESS;

export function emailConfigured(): boolean {
  return Boolean(apiKey && from && contactEmail && postalAddress);
}

export async function sendCheckupSummary(
  to: string,
  summary: string,
  options: { resumeUrl?: string } = {},
): Promise<boolean> {
  if (!emailConfigured()) return false;

  const unsubscribe = `mailto:${contactEmail}?subject=unsubscribe`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: from!,
      to,
      subject: "Your Know Plain retirement checkup",
      // List-Unsubscribe is required by Gmail/Yahoo bulk-sender rules and is the
      // cheapest deliverability insurance there is.
      headers: { "List-Unsubscribe": `<${unsubscribe}>` },
      text: [
        "Here's the summary from your Know Plain retirement checkup.",
        "",
        summary,
        "",
        ...(options.resumeUrl
          ? [
              "Resume your private account-saved scenario:",
              options.resumeUrl,
              "",
              "The link contains only an opaque record ID. You must sign in to the same account",
              "to open it; Know Plain's row-level access policy restricts the record to its owner.",
              "This email contains no ages, balances, income, spending, or debt values.",
            ]
          : [
              "Your ages, balances, and debts were never sent to us — the checkup runs entirely",
              "in your browser. We only stored your email and the line above.",
            ]),
        "",
        "This is educational information, not financial advice.",
        "",
        `Unsubscribe: reply to this email with "unsubscribe", or write to ${contactEmail}.`,
        postalAddress,
      ].join("\n"),
    });
    return !error;
  } catch {
    return false;
  }
}

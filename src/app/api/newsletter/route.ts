import { NextResponse, type NextRequest } from "next/server";
import { notifyPxlPeak } from "@/lib/pxlpeak";

/**
 * POST /api/newsletter
 *
 * Target for the static funnel pages under /public/retirement-roadmap, whose
 * forms do a native (non-fetch) submit. Until now `newsletterAction` was empty,
 * which put assets/site.js into "download-only mode": it called preventDefault
 * and told the visitor "Email capture is not connected yet", discarding the
 * address entirely. Verified 2026-08-14.
 *
 * Accepts form-encoded or JSON, captures the lead, and redirects back to the
 * page so a native form post lands somewhere sensible.
 */

function backTo(request: NextRequest, ok: boolean): NextResponse {
  const referer = request.headers.get("referer");
  const base = new URL(referer ?? "/retirement-roadmap/", request.url);
  base.searchParams.set("subscribed", ok ? "1" : "0");
  return NextResponse.redirect(base, { status: 303 });
}

export async function POST(request: NextRequest) {
  try {
    const type = request.headers.get("content-type") ?? "";
    let email = "";
    let firstName = "";

    if (type.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      email = String(body.email ?? "").trim();
      firstName = String(body.first_name ?? body.firstName ?? "").trim();
    } else {
      const form = await request.formData();
      email = String(form.get("email") ?? "").trim();
      firstName = String(form.get("first_name") ?? "").trim();
    }

    email = email.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return type.includes("application/json")
        ? NextResponse.json({ ok: false, error: "A valid email is required." }, { status: 400 })
        : backTo(request, false);
    }

    await notifyPxlPeak({
      email,
      message: firstName
        ? `Retirement Roadmap newsletter signup (${firstName})`
        : "Retirement Roadmap newsletter signup",
      source: "retirement_roadmap_newsletter",
    });

    return type.includes("application/json")
      ? NextResponse.json({ ok: true }, { status: 200 })
      : backTo(request, true);
  } catch {
    return backTo(request, false);
  }
}

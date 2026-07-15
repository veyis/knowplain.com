import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = pageMeta(
  "/forum/guidelines",
  "Community Guidelines",
  "Rules for safe, useful, privacy-conscious discussion on Know Plain.",
);

export default function CommunityGuidelinesPage() {
  return (
    <AppShell active="forum">
      <article className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Community", href: "/forum" }, { label: "Guidelines" }]} />
        <h1 className="text-3xl font-semibold tracking-tight">Community guidelines</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Ask candid questions and share useful experience without pretending that a forum reply is individualized financial, tax, legal, or medical advice.</p>
        <div className="mt-8 grid gap-8 leading-relaxed">
          <section><h2 className="text-xl font-semibold">Protect privacy</h2><p className="mt-2 text-muted-foreground">Do not post account numbers, addresses, phone numbers, email addresses, employer identifiers, medical records, or another person&rsquo;s private information. Use rounded figures when exact values are unnecessary.</p></section>
          <section><h2 className="text-xl font-semibold">Be honest about authority</h2><p className="mt-2 text-muted-foreground">Do not claim credentials, guaranteed outcomes, or professional relationships you cannot substantiate. Personal experience should be labeled as personal experience.</p></section>
          <section><h2 className="text-xl font-semibold">No promotion or manipulation</h2><p className="mt-2 text-muted-foreground">No spam, referral harvesting, solicitation, impersonation, harassment, coordinated voting, or urgency tactics. Disclose relevant financial relationships.</p></section>
          <section><h2 className="text-xl font-semibold">Moderation and reports</h2><p className="mt-2 text-muted-foreground">New discussions and replies may remain pending until review. Moderators may hide, lock, or annotate content. Signed-in readers can report spam, harassment, dangerous advice, or privacy exposure. Reports are private.</p></section>
        </div>
      </article>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema";
import { pageMeta, site } from "@/lib/site";
import { RetirementCheckup } from "./RetirementCheckup";

export const metadata = pageMeta(
  "/checkup",
  "Retirement Checkup",
  "A five-minute plain-language retirement snapshot with gap estimates, risk scores, and next steps.",
);

export default function CheckupPage() {
  return (
    <AppShell active="checkup">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Retirement Checkup", url: `${site.url}/checkup` },
          ]),
        ]}
      />
      <header className="mb-6 max-w-[760px]">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Flagship tool</p>
        <h1 className="mb-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight">
          Know where your retirement plan needs attention.
        </h1>
        <p className="text-muted-foreground">
          This checkup uses transparent assumptions to estimate a spending gap, a rough portfolio
          range, and the risks most worth testing next. Educational only.
        </p>
      </header>
      <RetirementCheckup />
    </AppShell>
  );
}


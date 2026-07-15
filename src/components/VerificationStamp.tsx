import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function VerificationStamp({
  label = "Checked against current sources",
  verified,
  sourceCount,
  volatile = false,
  detailsHref = "/sources",
}: {
  label?: string;
  verified: string;
  sourceCount?: number;
  volatile?: boolean;
  detailsHref?: string;
}) {
  return (
    <aside
      aria-label="Verification details"
      className="flex flex-wrap items-start gap-x-4 gap-y-2 rounded-lg bg-secondary px-3 py-2.5 text-xs text-muted-foreground"
    >
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
        {label}
      </span>
      <span>Last checked {verified}</span>
      {typeof sourceCount === "number" && (
        <span>{sourceCount} {sourceCount === 1 ? "source" : "sources"}</span>
      )}
      {volatile && (
        <span className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          Can change through legislation
        </span>
      )}
      <Link href={detailsHref} className="font-medium text-foreground underline underline-offset-2">
        Verify the method
      </Link>
    </aside>
  );
}

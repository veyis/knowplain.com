import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DecisionCta({
  title = "Turn this into your next step",
  body,
  toolHref,
  toolLabel,
}: {
  title?: string;
  body: string;
  toolHref: string;
  toolLabel: string;
}) {
  return (
    <aside className="my-8 rounded-xl border border-border bg-secondary/60 p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-foreground">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
      <Button asChild size="sm">
        <Link href={toolHref} className="gap-2">
          <Calculator className="size-4" />
          {toolLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </aside>
  );
}


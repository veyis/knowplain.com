"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Home,
  MessagesSquare,
  PlayCircle,
  Search,
  Wrench,
  GitCompareArrows,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { commandDocs } from "@/lib/command-docs";
import { glossary } from "@/lib/glossary";

const nav = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Plan", href: "/checkup", Icon: CheckCircle2 },
  { label: "Learn", href: "/topics/retirement", Icon: FileText },
  { label: "Calculate", href: "/tools", Icon: Wrench },
  { label: "Decide", href: "/decisions", Icon: GitCompareArrows },
  { label: "Community", href: "/forum", Icon: MessagesSquare },
];

const typeIcon = {
  explainer: FileText,
  tool: Wrench,
  video: PlayCircle,
  thread: MessagesSquare,
  decision: GitCompareArrows,
  glossary: BookOpen,
} as const;

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const explainers = commandDocs.filter((d) => d.type === "explainer");
  const tools = commandDocs.filter((d) => d.type === "tool");

  return (
    <>
      {/* Vercel-style search trigger that opens the ⌘K palette */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="group flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm text-muted-foreground transition-colors hover:bg-accent sm:h-9 sm:min-w-0 sm:flex-1 sm:justify-start sm:gap-2 sm:px-3"
        aria-label="Search (⌘K)"
      >
        <Search className="size-4 shrink-0 opacity-60" />
        <span className="hidden min-w-0 flex-1 truncate text-left sm:block">Search explainers, tools, terms…</span>
        <kbd className="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 [font-family:system-ui,sans-serif] text-[0.65rem] text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search Know Plain"
        description="Find explainers, tools, and glossary terms"
      >
        <CommandInput placeholder="Type to search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Go to">
            {nav.map(({ label, href, Icon }) => (
              <CommandItem key={href} value={`nav ${label}`} onSelect={() => go(href)}>
                <Icon />
                <span>{label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Explainers">
            {explainers.map((d) => {
              const Icon = typeIcon[d.type];
              return (
                <CommandItem
                  key={d.href}
                  value={`${d.title} ${d.snippet}`}
                  onSelect={() => go(d.href)}
                >
                  <Icon />
                  <span className="truncate">{d.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Tools & community">
            {tools.map((d) => {
              const Icon = typeIcon[d.type];
              return (
                <CommandItem
                  key={d.href}
                  value={`${d.title} ${d.snippet}`}
                  onSelect={() => go(d.href)}
                >
                  <Icon />
                  <span className="truncate">{d.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Glossary">
            {glossary.map((t) => (
              <CommandItem
                key={t.id}
                value={`${t.term} ${t.definition}`}
                onSelect={() => go(`/glossary#${t.id}`)}
              >
                <BookOpen />
                <span className="truncate">{t.term}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

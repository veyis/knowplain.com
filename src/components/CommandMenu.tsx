"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Home,
  MessagesSquare,
  PlayCircle,
  Search,
  Wrench,
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
import { searchIndex } from "@/lib/content";
import { glossary } from "@/lib/glossary";

const nav = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Topics", href: "/topics/retirement", Icon: FileText },
  { label: "Tools", href: "/tools", Icon: Wrench },
  { label: "Videos", href: "/watch", Icon: PlayCircle },
  { label: "Forum", href: "/forum", Icon: MessagesSquare },
];

const typeIcon = {
  explainer: FileText,
  tool: Wrench,
  video: PlayCircle,
  thread: MessagesSquare,
} as const;

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

  const explainers = searchIndex.filter((d) => d.type === "explainer");
  const tools = searchIndex.filter((d) => d.type === "tool");

  return (
    <>
      {/* Vercel-style search trigger that opens the ⌘K palette */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
        aria-label="Search (⌘K)"
      >
        <Search className="size-4 shrink-0 opacity-60" />
        <span className="flex-1 text-left">Search explainers, tools, terms…</span>
        <kbd className="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 [font-family:system-ui,sans-serif] text-[0.65rem] text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
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

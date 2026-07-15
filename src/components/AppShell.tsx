import Link from "next/link";
import { AuthControls } from "./AuthControls";
import { CommandMenu } from "./CommandMenu";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return (
    <div className="app-shell grid min-h-screen min-w-0 grid-cols-[minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-50 -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar active={active} />
      <div className="flex min-w-0 flex-col">
        <header className="print-hidden sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/80 px-2 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sm:gap-3 sm:px-4 md:px-5">
          <CommandMenu />
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/about">About</Link>
            </Button>
            <AuthControls />
            <span className="hidden min-[360px]:contents">
              <ThemeToggle />
            </span>
            <Button size="sm" asChild>
              <Link href="/checkup">
                <span className="sm:hidden">Checkup</span>
                <span className="hidden sm:inline">Start checkup</span>
              </Link>
            </Button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-shell flex-1 px-4 py-6 outline-none md:px-6 md:py-8">
          {children}
        </main>
        <footer className="print-hidden mx-auto w-full max-w-shell border-t border-border px-4 py-8 text-xs text-muted-foreground md:px-6">
          <div className="mb-3 flex flex-wrap gap-4">
            <Link href="/about" className="transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/editorial-policy" className="transition-colors hover:text-foreground">
              Editorial standards
            </Link>
            <Link href="/glossary" className="transition-colors hover:text-foreground">
              Glossary
            </Link>
            <Link href="/sources" className="transition-colors hover:text-foreground">
              2026 numbers
            </Link>
            <Link href="/changes/2026" className="transition-colors hover:text-foreground">
              What changed in 2026
            </Link>
            {/* Was a true orphan: zero inbound links sitewide, and it is the page the
                Organization schema now points `publishingPrinciples` at. */}
            <Link href="/methodology" className="transition-colors hover:text-foreground">
              Methodology
            </Link>
            <Link href="/disclosure" className="transition-colors hover:text-foreground">
              Disclosure
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/operations" className="transition-colors hover:text-foreground">
              Operations
            </Link>
            <Link href="/forum/guidelines" className="transition-colors hover:text-foreground">
              Community guidelines
            </Link>
            <a
              href="https://www.youtube.com/@explainstudio9"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              YouTube
            </a>
          </div>
          <p>
            Educational content only. Not financial, tax, medical, or legal advice. Some links are
            affiliates.
          </p>
        </footer>
      </div>
    </div>
  );
}

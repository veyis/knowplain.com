import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { CommandMenu } from "./CommandMenu";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  // Degrade gracefully if Supabase isn't configured (missing env) — content
  // pages must render signed-out rather than 500.
  let user: User | null = null;
  try {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null;
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      <Sidebar active={active} />
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:px-5">
          <CommandMenu />
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/about">About</Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <form action="/login" method="POST">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    formAction={async () => {
                      "use server";
                      const { signout } = await import("@/app/login/actions");
                      await signout();
                    }}
                  >
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            )}
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="/tools">Get roadmap</Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-shell flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-shell border-t border-border px-4 py-8 text-xs text-muted-foreground md:px-6">
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
            <Link href="/disclosure" className="transition-colors hover:text-foreground">
              Disclosure
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
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

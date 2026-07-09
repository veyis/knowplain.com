import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SearchForm } from "./SearchForm";
import { Sidebar } from "./Sidebar";
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
    <div className="grid min-h-screen md:grid-cols-[220px_1fr]">
      <Sidebar active={active} />
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-4 border-b border-line bg-surface px-4 py-3 md:px-5">
          <SearchForm />
          <div className="ml-auto flex items-center gap-2">
            <Link href="/about" className="kp-btn hidden sm:inline-flex">
              About
            </Link>
            {user ? (
              <form action="/login" method="POST">
                <button formAction={async () => {
                  'use server'
                  const { signout } = await import('@/app/login/actions')
                  await signout()
                }} className="kp-btn">
                  Sign out ({user.email})
                </button>
              </form>
            ) : (
              <Link href="/login" className="kp-btn">
                Sign in
              </Link>
            )}
            <Link href="/tools" className="kp-btn-primary">
              Get roadmap
            </Link>
          </div>
        </div>
        <main className="mx-auto w-full max-w-shell flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-shell border-t border-line px-4 py-8 text-xs text-muted md:px-6">
          <div className="mb-3 flex flex-wrap gap-4">
            <Link href="/about">About</Link>
            <Link href="/editorial-policy">Editorial standards</Link>
            <Link href="/glossary">Glossary</Link>
            <Link href="/disclosure">Disclosure</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="https://www.youtube.com/@explainstudio9" rel="noopener noreferrer">
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

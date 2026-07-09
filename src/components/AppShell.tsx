import Link from "next/link";
import { SearchForm } from "./SearchForm";
import { Sidebar } from "./Sidebar";

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
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
            <Link href="/tools" className="kp-btn-primary">
              Get roadmap
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-shell flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
        <footer className="mx-auto w-full max-w-shell border-t border-line px-4 py-8 text-xs text-muted md:px-6">
          <div className="mb-3 flex flex-wrap gap-4">
            <Link href="/about">About</Link>
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

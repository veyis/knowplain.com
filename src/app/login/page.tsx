import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { login, signup } from "./actions";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <AppShell active="home">
      <div className="mx-auto mt-10 max-w-sm rounded-[14px] border border-line bg-card p-6 shadow-soft">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}
        {/* Signing up with email confirmation on succeeds without a session. Without this the
            user was bounced to the homepage still logged out and never told why. */}
        {message && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        )}
        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm outline-hidden focus:border-ink focus:bg-card"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm outline-hidden focus:border-ink focus:bg-card"
            />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <Button formAction={login} className="w-full">
              Log in
            </Button>
            <Button variant="outline" formAction={signup} className="w-full">
              Sign up
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

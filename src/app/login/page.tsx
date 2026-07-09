import { AppShell } from "@/components/AppShell";
import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AppShell active="home">
      <div className="mx-auto mt-10 max-w-sm rounded-[14px] border border-line bg-white p-6 shadow-soft">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
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
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm outline-hidden focus:border-ink focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm outline-hidden focus:border-ink focus:bg-white"
            />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <button formAction={login} className="kp-btn-primary w-full text-center">
              Log in
            </button>
            <button formAction={signup} className="w-full rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas">
              Sign up
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

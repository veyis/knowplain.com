import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (relativePath) =>
  readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), "utf8");

test("public content and calculator pages do not use cookie-aware Supabase clients", () => {
  const staticPages = [
    "src/app/page.tsx",
    "src/app/checkup/page.tsx",
    "src/app/tools/[slug]/page.tsx",
    "src/app/tools/withdrawal-simulator/page.tsx",
    "src/app/watch/page.tsx",
    "src/app/watch/[slug]/page.tsx",
  ];

  for (const page of staticPages) {
    const source = read(page);
    assert.doesNotMatch(source, /@\/lib\/supabase\/server/, `${page} must remain static`);
    assert.doesNotMatch(source, /cookies\s*\(/, `${page} must not opt into request-time rendering`);
  }
});

test("the public-shell auth control does not import the Supabase browser SDK", () => {
  const authControl = readFileSync(
    fileURLToPath(new URL("../src/components/AuthControls.tsx", import.meta.url)),
    "utf8",
  );
  const authStatusRoute = readFileSync(
    fileURLToPath(new URL("../src/app/api/auth-status/route.ts", import.meta.url)),
    "utf8",
  );
  assert.doesNotMatch(authControl, /@supabase|supabase\/client|createClient\(/);
  assert.match(authControl, /fetch\("\/api\/auth-status"/);
  assert.match(authStatusRoute, /Cache-Control": "private, no-store, max-age=0"/);
  assert.match(authStatusRoute, /supabase\.auth\.getUser\(\)/);
});

test("video transcript pages enumerate their static catalog", () => {
  const source = read("src/app/watch/[slug]/page.tsx");
  assert.match(source, /export function generateStaticParams\(\)/);
  assert.match(source, /fallbackVideos\.map/);
});

test("auth refresh proxy preserves Supabase cookie rotation without opting pages into dynamic APIs", () => {
  const proxy = read("src/proxy.ts");
  const middleware = read("src/lib/supabase/middleware.ts");
  assert.match(proxy, /updateSession\(request\)/);
  assert.match(middleware, /request\.cookies\.getAll\(\)/);
  assert.match(middleware, /supabaseResponse\.cookies\.set/);
  assert.match(middleware, /await supabase\.auth\.getUser\(\)/);
  assert.doesNotMatch(middleware, /cookies\s*\(\)/);
});

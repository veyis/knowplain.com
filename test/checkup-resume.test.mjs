import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { checkupResumePath } from "../src/lib/checkup-resume.ts";

test("resume paths contain only a canonical opaque UUID", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";
  assert.equal(checkupResumePath(id), `/checkup?saved=${id}`);
  assert.equal(checkupResumePath("../../profile"), null);
  assert.equal(checkupResumePath("123e4567-e89b-02d3-a456-426614174000"), null);
  assert.equal(checkupResumePath("123e4567-e89b-42d3-c456-426614174000"), null);
});

test("account resume email is derived server-side and remains owner-gated", () => {
  const action = readFileSync(fileURLToPath(new URL("../src/app/checkup/actions.ts", import.meta.url)), "utf8");
  const email = readFileSync(fileURLToPath(new URL("../src/lib/email.ts", import.meta.url)), "utf8");
  const migration = readFileSync(fileURLToPath(new URL("../supabase/migrations/20260715033739_saved_retirement_checkups.sql", import.meta.url)), "utf8");

  assert.match(action, /supabase\.auth\.getUser\(\)/);
  assert.match(action, /runRetirementCheckup\(input\)\.summary/);
  assert.match(action, /\.select\("id"\)\.single\(\)/);
  assert.match(email, /This email contains no ages, balances, income, spending, or debt values/);
  assert.match(email, /sign in to the same account/i);
  assert.match(migration, /using \(\(select auth\.uid\(\)\) = user_id\)/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const migrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260715031454_harden_forum_rls_and_atomic_thread.sql",
    import.meta.url,
  ),
);
const migration = readFileSync(migrationPath, "utf8");
const savedCheckupsMigrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260715033739_saved_retirement_checkups.sql",
    import.meta.url,
  ),
);
const savedCheckupsMigration = readFileSync(savedCheckupsMigrationPath, "utf8");
const grantsMigrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260715035640_explicit_data_api_grants.sql",
    import.meta.url,
  ),
);
const grantsMigration = readFileSync(grantsMigrationPath, "utf8");
const searchMigrationPath = fileURLToPath(
  new URL("../supabase/migrations/20260715040227_search_index_v2.sql", import.meta.url),
);
const searchMigration = readFileSync(searchMigrationPath, "utf8");
const moderationMigrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260715040433_forum_moderation_reports_and_rate_limits.sql",
    import.meta.url,
  ),
);
const moderationMigration = readFileSync(moderationMigrationPath, "utf8");
const privateHelpersMigrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260715040612_move_trigger_helpers_private.sql",
    import.meta.url,
  ),
);
const privateHelpersMigration = readFileSync(privateHelpersMigrationPath, "utf8");

test("forum insert policies bind authorship to the authenticated user", () => {
  assert.match(
    migration,
    /create policy "Users can create their own threads"[\s\S]*?to authenticated[\s\S]*?with check \(\(select auth\.uid\(\)\) = author_id\)/,
  );
  assert.match(
    migration,
    /create policy "Users can create their own posts"[\s\S]*?to authenticated[\s\S]*?with check \(\(select auth\.uid\(\)\) = author_id\)/,
  );
  assert.doesNotMatch(migration, /auth\.role\(\)/);
});

test("saved simulation updates cannot transfer row ownership", () => {
  assert.match(
    migration,
    /create policy "Users can update their own saved simulations"[\s\S]*?using \(\(select auth\.uid\(\)\) = user_id\)[\s\S]*?with check \(\(select auth\.uid\(\)\) = user_id\)/,
  );
});

test("atomic thread RPC is tightly scoped", () => {
  assert.match(migration, /security definer\s+set search_path = ''/);
  assert.match(migration, /caller_id uuid := auth\.uid\(\)/);
  assert.match(migration, /revoke execute[\s\S]*from public/);
  assert.match(migration, /revoke execute[\s\S]*from anon/);
  assert.match(migration, /grant execute[\s\S]*to authenticated/);
  assert.match(migration, /insert into public\.knowplain_forum_threads/);
  assert.match(migration, /insert into public\.knowplain_forum_posts/);
});

test("account-saved checkups are bounded and owner-only", () => {
  assert.match(savedCheckupsMigration, /references auth\.users\(id\) on delete cascade/);
  assert.match(savedCheckupsMigration, /char_length\(btrim\(name\)\) between 1 and 48/);
  assert.match(savedCheckupsMigration, /octet_length\(input::text\) <= 4096/);
  assert.match(savedCheckupsMigration, /alter table public\.knowplain_saved_checkups enable row level security/);

  for (const operation of ["select", "insert", "update", "delete"]) {
    const policy = new RegExp(
      `create policy "Users can [^"]+ saved checkups"[\\s\\S]*?for ${operation}[\\s\\S]*?to authenticated`,
    );
    assert.match(savedCheckupsMigration, policy);
  }

  assert.match(
    savedCheckupsMigration,
    /for update[\s\S]*?using \(\(select auth\.uid\(\)\) = user_id\)[\s\S]*?with check \(\(select auth\.uid\(\)\) = user_id\)/,
  );
  assert.doesNotMatch(savedCheckupsMigration, /grant .* to (?:public|anon)/i);
});

test("Data API grants are explicit and least-privilege", () => {
  for (const table of [
    "profiles",
    "forum_threads",
    "forum_posts",
    "forum_likes",
    "search_index",
    "videos",
    "saved_simulations",
    "saved_checkups",
    "leads",
  ]) {
    assert.match(
      grantsMigration,
      new RegExp(`revoke all on table public\\.knowplain_${table} from anon, authenticated`),
    );
  }
  assert.match(grantsMigration, /grant insert on table public\.knowplain_leads to anon, authenticated/);
  assert.doesNotMatch(grantsMigration, /grant (?:select|all).*knowplain_leads to anon/i);
  assert.doesNotMatch(grantsMigration, /grant .*knowplain_saved_(?:simulations|checkups) to anon/i);
  assert.match(
    grantsMigration,
    /grant select, insert, update, delete\s+on table public\.knowplain_saved_checkups to authenticated/,
  );
});

test("Postgres search preserves weighted fields and a tightly scoped RPC", () => {
  assert.match(searchMigration, /add column if not exists aliases text\[\]/);
  assert.match(searchMigration, /add column if not exists body text/);
  assert.match(searchMigration, /setweight\(to_tsvector\('english', coalesce\(title/);
  assert.match(searchMigration, /using gin \(fts\)/);
  assert.match(searchMigration, /security invoker\s+set search_path = ''/);
  assert.match(searchMigration, /char_length\(btrim\(search_query\)\) between 1 and 200/);
  assert.match(searchMigration, /limit least\(greatest\(result_limit, 1\), 100\)/);
  assert.match(searchMigration, /revoke execute[\s\S]*from public/);
  assert.match(searchMigration, /grant execute[\s\S]*to anon, authenticated/);
});

test("community writes are moderated, reportable, and rate-limited", () => {
  assert.match(moderationMigration, /status text not null default 'pending'/);
  assert.match(moderationMigration, /status in \('published', 'locked'\)[\s\S]*auth\.uid\(\).*author_id/);
  assert.match(moderationMigration, /create table public\.knowplain_forum_reports/);
  assert.match(moderationMigration, /with check \(\(select auth\.uid\(\)\) = reporter_id\)/);
  assert.match(moderationMigration, /revoke all on table public\.knowplain_forum_reports from anon, authenticated/);
  assert.match(moderationMigration, /created_at > now\(\) - interval '1 hour'[\s\S]*>= 3/);
  assert.match(moderationMigration, /created_at > now\(\) - interval '1 hour'[\s\S]*>= 10/);
  assert.match(moderationMigration, /security definer\s+set search_path = ''/);
  assert.match(moderationMigration, /revoke execute[\s\S]*knowplain_create_forum_post[\s\S]*from public, anon/);
});

test("trigger-only privileged helpers are outside the exposed public schema", () => {
  assert.match(privateHelpersMigration, /create schema if not exists private/);
  assert.match(
    privateHelpersMigration,
    /revoke all on schema private from public, anon, authenticated/,
  );
  assert.match(
    privateHelpersMigration,
    /function private\.knowplain_handle_new_user\(\)[\s\S]*security definer[\s\S]*set search_path = ''/,
  );
  assert.match(
    privateHelpersMigration,
    /execute procedure private\.knowplain_handle_new_user\(\)/,
  );
  assert.match(
    privateHelpersMigration,
    /drop function if exists public\.knowplain_handle_new_user\(\)/,
  );
});

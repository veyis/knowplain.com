# Know Plain Supabase security model

Last reviewed: 2026-07-14

Data API privileges and row-level security are separate controls:

- SQL grants decide whether `anon` or `authenticated` may attempt an operation.
- RLS policies decide which rows an allowed operation may read or affect.
- `service_role` is reserved for trusted server/operations work and bypasses RLS. It must never be exposed to a browser.

## Access matrix

| Table | Anonymous | Authenticated | Row rule |
|---|---|---|---|
| `knowplain_profiles` | Select | Select, insert, update | A user may insert or update only their own profile. Public display names remain readable for bylines. |
| `knowplain_forum_threads` | Select | Select, insert | New rows must use the caller as `author_id`; thread plus first post is created through the atomic RPC. |
| `knowplain_forum_posts` | Select | Select, insert | New rows must use the caller as `author_id`. |
| `knowplain_forum_likes` | Select | Select, insert, delete | A user may create or remove only their own likes. |
| `knowplain_search_index` | Select | Select | Only trusted service operations may write. |
| `knowplain_videos` | Select | Select | Only trusted service operations may write. Public pages currently build from the repository catalog. |
| `knowplain_saved_simulations` | None | Select, insert, update, delete | Owner rows only; updates cannot transfer ownership. |
| `knowplain_saved_checkups` | None | Select, insert, update, delete | Owner rows only; updates cannot transfer ownership. |
| `knowplain_leads` | Insert | Insert | No browser role may read, update, or delete lead records. |

The authoritative explicit grants are in `20260715035640_explicit_data_api_grants.sql`. RLS definitions live in the schema and security migrations. The grants intentionally begin with `revoke all` so future platform defaults cannot silently widen access.

## Verification

Run `supabase/tests/rls_verification.sql` against an isolated local Supabase database after migrations. It checks:

1. every public table has RLS enabled;
2. anonymous grants match the matrix;
3. anonymous callers can read public profiles but cannot access saved plans;
4. an authenticated owner can read and update their profile and saved plan;
5. a different authenticated user cannot read or update the owner's private rows;
6. ownership policies include both `USING` and `WITH CHECK` where transfer must be prevented.

Do not run the behavioral fixture section against production. The script wraps fixtures in a transaction and rolls back, but local CI is the intended environment.

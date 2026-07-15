# Know Plain performance budgets

## Public-shell authentication control

Measured from the production homepage client-reference manifest after `pnpm build` using `pnpm check:auth-bundle`.

| Measurement | Before | Current | Change |
| --- | ---: | ---: | ---: |
| Chunks associated with `AuthControls` | 4 | 4 | no change |
| Associated raw JavaScript | 434,369 B | 189,473 B | −244,896 B |
| Associated gzip JavaScript | 127,503 B | 63,843 B | −63,660 B |
| Supabase-client dependency chunk | 338,269 B raw / 94,137 B gzip | 0 B | removed |

The associated total includes shared shell code such as Next Link, the command menu, icons, and theme controls, so it is not an attribution claim for `AuthControls` alone. The dependency-specific measurement is exact: before the change, the control imported the browser Supabase client and caused its 94,137-byte gzip chunk to appear in the public shell’s chunk set. It now calls a same-origin, no-store status endpoint, and the public-shell budget for Supabase client code is **0 bytes gzip**.

The check fails when any chunk referenced by the homepage `AuthControls` client-manifest entry contains Supabase client signatures. Run it after every production build:

```sh
pnpm build
pnpm check:auth-bundle
```

This preserves static public HTML while moving cookie-aware authentication work to `/api/auth-status`. The tradeoff is one small, private status request after hydration when Supabase is configured; public content delivery no longer pays the full database, realtime, storage, and authentication SDK parse cost merely to show “Sign in” or “Profile.”

#!/usr/bin/env bash
set -euo pipefail

BOX="${VOX_DB_SSH:-john@5.78.223.198}"
CONTAINER="${VOX_DB_CONTAINER:-supabase-db-xezfz9hytgcrlgpx92a80ujp}"
DB_IP="${VOX_DB_DOCKER_IP:-10.0.2.5}"
LPORT="${VOX_DB_LPORT:-54399}"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
[ -z "$LAN_IP" ] && { echo "Could not determine LAN IP (en0/en1)."; exit 1; }

PW="$(ssh -o BatchMode=yes -o ConnectTimeout=12 "$BOX" "docker exec $CONTAINER printenv POSTGRES_PASSWORD")"
[ -z "$PW" ] && { echo "Could not read POSTGRES_PASSWORD from $CONTAINER on $BOX."; exit 1; }

cleanup() { pkill -f "${LPORT}:${DB_IP}:5432" 2>/dev/null || true; }
trap cleanup EXIT

ssh -fN -o BatchMode=yes -o ConnectTimeout=12 -o ExitOnForwardFailure=yes \
  -L "0.0.0.0:${LPORT}:${DB_IP}:5432" "$BOX"
sleep 2

# Password rides PGPASSWORD (kept out of argv / process list), not the URL.
PGPASSWORD="$PW" pnpm exec supabase db push --db-url "postgresql://postgres@${LAN_IP}:${LPORT}/postgres?sslmode=disable"

# Also notify PostgREST to reload the schema cache so new tables show up immediately via REST API.
PGPASSWORD="$PW" psql -h "${LAN_IP}" -p "${LPORT}" -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema'"

echo "\n✓ Successfully pushed migrations to live DB."

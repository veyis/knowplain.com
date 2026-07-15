import { createClient } from "@supabase/supabase-js";
import { searchIndex } from "../src/lib/content";
import * as dotenv from "dotenv";

const rows = searchIndex.map((doc) => ({
  id: `${doc.type}-${doc.href}`,
  type: doc.type,
  title: doc.title,
  href: doc.href,
  snippet: doc.snippet,
  pillar: doc.pillar || null,
  aliases: doc.aliases || [],
  keywords: doc.keywords || [],
  body: doc.body || "",
}));

async function sync() {
  const ids = new Set(rows.map((row) => row.id));
  if (ids.size !== rows.length) throw new Error("Search document ids must be unique.");
  if (rows.some((row) => !row.title.trim() || !row.href.startsWith("/"))) {
    throw new Error("Every search document needs a title and internal href.");
  }

  if (process.argv.includes("--dry-run")) {
    console.log(`Validated ${rows.length} search documents without uploading.`);
    return;
  }

  dotenv.config({ path: ".env.local" });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // The service key is required because browser roles intentionally have read-only access.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  console.log(`Syncing ${rows.length} documents to Supabase...`);

  const { error } = await supabase
    .from("knowplain_search_index")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Error syncing to Supabase:", error);
    process.exit(1);
  }

  const { data: existing, error: readError } = await supabase
    .from("knowplain_search_index")
    .select("id");
  if (readError) throw readError;
  const staleIds = (existing || []).map((row) => row.id).filter((id) => !ids.has(id));
  if (staleIds.length) {
    const { error: deleteError } = await supabase
      .from("knowplain_search_index")
      .delete()
      .in("id", staleIds);
    if (deleteError) throw deleteError;
  }

  console.log(`Successfully synced search index; removed ${staleIds.length} stale rows.`);
}

void sync().catch((error) => {
  console.error(error instanceof Error ? error.message : "Search sync failed.");
  process.exit(1);
});

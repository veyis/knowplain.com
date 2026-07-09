import { createClient } from "@supabase/supabase-js";
import { searchIndex } from "../src/lib/content";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// You must provide SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS for inserts
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sync() {
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  console.log(`Syncing ${searchIndex.length} documents to Supabase...`);

  const { error } = await supabase.from("knowplain_search_index").upsert(
    searchIndex.map((doc) => ({
      id: `${doc.type}-${doc.href}`,
      type: doc.type,
      title: doc.title,
      href: doc.href,
      snippet: doc.snippet,
      pillar: doc.pillar || null,
    })),
    { onConflict: 'id' }
  );

  if (error) {
    console.error("Error syncing to Supabase:", error);
    process.exit(1);
  }

  console.log("Successfully synced search index!");
}

sync();

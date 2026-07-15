import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const manifestPath = resolve(".next/server/app/page_client-reference-manifest.js");
const source = readFileSync(manifestPath, "utf8");
const assignment = 'globalThis.__RSC_MANIFEST["/page"] = ';
const start = source.indexOf(assignment);
if (start < 0) throw new Error("Homepage client-reference manifest was not found. Run pnpm build first.");
const manifest = JSON.parse(source.slice(start + assignment.length).replace(/;\s*$/, ""));
const entry = Object.entries(manifest.clientModules).find(
  ([key]) => key.endsWith("/src/components/AuthControls.tsx"),
);
if (!entry) throw new Error("AuthControls was not found in the homepage client manifest.");

const chunks = [...new Set(entry[1].chunks)];
const measured = chunks.map((chunk) => {
  const path = resolve(".next", chunk.replace(/^\/_next\//, ""));
  const contents = readFileSync(path);
  return {
    chunk,
    rawBytes: statSync(path).size,
    gzipBytes: gzipSync(contents).byteLength,
    containsSupabaseClient:
      contents.includes("supabaseUrl is required") ||
      contents.includes("@supabase/supabase-js") ||
      contents.includes("SupabaseClient"),
  };
});

const dependencyChunks = measured.filter((chunk) => chunk.containsSupabaseClient);
const dependencyGzipBytes = dependencyChunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0);
const report = {
  authAssociatedChunks: measured.length,
  authAssociatedRawBytes: measured.reduce((sum, chunk) => sum + chunk.rawBytes, 0),
  authAssociatedGzipBytes: measured.reduce((sum, chunk) => sum + chunk.gzipBytes, 0),
  supabaseClientChunks: dependencyChunks.map((chunk) => chunk.chunk),
  supabaseClientGzipBytes: dependencyGzipBytes,
  budgetBytes: 0,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (dependencyGzipBytes > 0) {
  throw new Error(`Public shell includes ${dependencyGzipBytes} gzip bytes of Supabase client code; budget is 0.`);
}

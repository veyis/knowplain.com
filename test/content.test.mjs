import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../content/", import.meta.url));
const PILLARS = new Set(["retirement", "money-psychology", "decision-tools"]);
const REQUIRED = ["title", "description", "plainAnswer", "updated"];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    // videos/ is a separate collection with its own schema (validated by CC).
    if (name === "videos") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".mdx")) out.push(p);
  }
  return out;
}

test("every article has valid frontmatter, pillar, unique slug, and a real body", () => {
  const files = walk(ROOT);
  assert.ok(files.length >= 8, `expected >=8 articles, found ${files.length}`);

  const slugs = new Set();
  for (const file of files) {
    const rel = file.slice(ROOT.length); // "<pillar>/<slug>.mdx"
    const [pillar, fname] = rel.split(/[/\\]/);
    const slug = fname.replace(/\.mdx$/, "");

    assert.ok(PILLARS.has(pillar), `${rel}: invalid pillar "${pillar}"`);
    assert.ok(!slugs.has(slug), `duplicate slug "${slug}"`);
    slugs.add(slug);

    const raw = readFileSync(file, "utf8");
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    assert.ok(m, `${rel}: missing frontmatter`);
    const [, fm, body] = m;
    for (const key of REQUIRED) {
      assert.match(fm, new RegExp(`^${key}:`, "m"), `${rel}: missing "${key}"`);
    }
    assert.ok(body.trim().length > 200, `${rel}: body too short`);
  }
});

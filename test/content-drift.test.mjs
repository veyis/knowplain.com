import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FACTS, resolveFacts } from "../src/lib/facts-display.ts";

/**
 * The guard that would have caught the original defect.
 *
 * The 4% rule article told readers Morningstar said "3.3-4%" while facts-2026.ts said 3.9%.
 * Nothing caught it, because prose numbers were hand-typed and nothing compared them to the
 * fact layer. `<Fact>` fixes that in the MDX body and `{{fact.id}}` fixes it in frontmatter —
 * but only if people actually use them. These tests make skipping them fail the build.
 */

const files = [];
for (const pillar of fs.readdirSync("content")) {
  const dir = path.join("content", pillar);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) files.push(path.join(dir, f));
}

const frontmatter = (src) => {
  const end = src.indexOf("\n---", 4);
  return src.startsWith("---") && end > 0 ? src.slice(0, end) : "";
};

test("every {{fact.id}} token in content resolves", () => {
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    for (const [, id] of src.matchAll(/\{\{([A-Za-z0-9.]+)\}\}/g)) {
      assert.ok(
        FACTS[id] !== undefined,
        `${file} uses {{${id}}}, which is not in facts-display.ts. Add it there, sourced — do not hand-type the number.`,
      );
    }
    // And the whole frontmatter must render without throwing.
    assert.doesNotThrow(() => resolveFacts(frontmatter(src)), `${file}: frontmatter failed to resolve`);
  }
});

test("frontmatter does not hand-type a figure the fact layer already owns", () => {
  // Only the DISTINCTIVE values — a dollar amount with a comma, or a percentage with a
  // decimal / 3+ digits. Bare round numbers ("4%", "50%", "67") are deliberately excluded:
  // "30-50% equity" is not the Saver's Match rate, and "4%" appears inside "24%". A regex
  // cannot disambiguate those, so they stay literal and this test does not police them.
  const owned = Object.entries(FACTS).filter(
    ([, v]) => /^\$\d{1,3}(,\d{3})+$/.test(v) || /^\d+\.\d+%$/.test(v) || /^\d{3,}%$/.test(v),
  );

  const offenders = [];
  for (const file of files) {
    const fm = frontmatter(fs.readFileSync(file, "utf8"));
    for (const [id, value] of owned) {
      const esc = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`(?<![\\d.,%$])${esc}(?![\\d.,%])`).test(fm)) {
        offenders.push(`${file}: "${value}" is hand-typed — use {{${id}}}`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Frontmatter becomes the meta description, the answer snippet, and the Article schema. A number typed there drifts from facts-2026.ts the moment the tax year turns:\n  ${offenders.join("\n  ")}`,
  );
});

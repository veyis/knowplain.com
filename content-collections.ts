import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

const articles = defineCollection({
  name: "articles",
  directory: "content",
  include: "**/*.mdx",
  exclude: ["videos/**/*.mdx"],
  schema: z.object({
    content: z.string(),
    title: z.string(),
    description: z.string(),
    plainAnswer: z.string(),
    published: z.string().optional(),
    updated: z.string(),
    reviewed: z.string().optional(),
    author: z.string().optional(),
    reviewer: z.string().optional(),
    contentType: z
      .enum(["explainer", "decision", "tool-guide", "source-note"])
      .optional(),
    riskLevel: z.enum(["low", "medium", "high"]).optional(),
    sources: z
      .array(
        z.object({
          title: z.string(),
          publisher: z.string(),
          url: z.string(),
          accessed: z.string().optional(),
          note: z.string().optional(),
        }),
      )
      .optional(),
    faqs: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .optional(),
    relatedTools: z
      .array(z.object({ href: z.string(), label: z.string() }))
      .optional(),
    relatedDecisions: z
      .array(z.object({ href: z.string(), label: z.string() }))
      .optional(),
    related: z
      .array(z.object({ href: z.string(), label: z.string() }))
      .optional(),
  }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc);
    // content/<pillar>/<slug>.mdx  ->  _meta.path = "<pillar>/<slug>"
    const [pillar, slug] = doc._meta.path.split("/");
    return { ...doc, mdx, pillar, slug, url: `/topics/${pillar}/${slug}` };
  },
});

export default defineConfig({ content: [articles] });

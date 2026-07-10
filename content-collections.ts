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
    updated: z.string(),
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

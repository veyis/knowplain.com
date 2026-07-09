import { ImageResponse } from "next/og";
import { articles, getArticle } from "@/lib/content";
import { pillars, site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} explainer`;

export function generateStaticParams() {
  return articles.map((a) => ({ pillar: a.pillar, slug: a.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { pillar, slug } = await params;
  const article = getArticle(pillar, slug);
  const kicker = article ? pillars[article.pillar].title : site.tagline;
  const title = article?.title ?? site.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f7f5",
          color: "#121212",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#1c4ed8",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#667085" }}>
          {`${site.name} · Educational only`}
        </div>
      </div>
    ),
    { ...size },
  );
}

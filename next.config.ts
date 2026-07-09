import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Preserved legacy static pages live in public/. Next serves flat files
  // (/assets/*, /pack/*) directly, but does NOT serve public/<dir>/index.html
  // at /<dir>, so map the two directory pages to their index.html.
  async rewrites() {
    return [
      { source: "/retirement-roadmap", destination: "/retirement-roadmap/index.html" },
      { source: "/books", destination: "/books/index.html" },
    ];
  },
};

export default nextConfig;

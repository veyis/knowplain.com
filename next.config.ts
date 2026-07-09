import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

// ponytail: 'unsafe-inline' for scripts/styles — this content site renders no
// user-supplied HTML (no XSS sink) and the App Router uses inline bootstrap
// scripts. Upgrade path if the threat model changes: nonce-based CSP via
// middleware (costs static caching, so not worth it today).
// Google Fonts entries are for the preserved legacy static pages under public/.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Preserved legacy static pages live in public/. Next serves flat files
  // (/assets/*, /pack/*) directly, but does NOT serve public/<dir>/index.html
  // at /<dir>, so map the two directory pages to their index.html.
  async rewrites() {
    return [
      { source: "/retirement-roadmap", destination: "/retirement-roadmap/index.html" },
      { source: "/books", destination: "/books/index.html" },
      // Legacy static pages declare no <link rel=icon>; serve the generated
      // icon at the /favicon.ico path browsers and crawlers probe by default.
      { source: "/favicon.ico", destination: "/icon" },
    ];
  },
};

// withContentCollections must be the last wrapper applied to the config.
export default withContentCollections(nextConfig);

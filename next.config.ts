import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.web.squarecdn.com https://web.squarecdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://sandbox.web.squarecdn.com https://web.squarecdn.com",
      "font-src 'self' https://fonts.gstatic.com https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
      "img-src 'self' data: blob: https://*.cdninstagram.com https://*.fbcdn.net https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com https://d1g145x70srn7h.cloudfront.net",
      "media-src 'self'",
      "connect-src 'self' https://*.public.blob.vercel-storage.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://sandbox.web.squarecdn.com https://web.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://o160250.ingest.sentry.io",
      "frame-src https://sandbox.web.squarecdn.com https://web.squarecdn.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
    ];
  },
};

export default nextConfig;

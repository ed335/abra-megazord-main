/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_AGORA_APP_ID: process.env.AGORA_APP_ID,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  allowedDevOrigins: [
    "4ded4973-8f8f-43c8-9cc1-50740836af74-00-3g4tngifxlzi4.janeway.replit.dev",
    "*.replit.dev",
    "*.repl.co",
    "127.0.0.1",
    "localhost",
    "0.0.0.0"
  ],
  async rewrites() {
    return [
      {
        source: '/upload/:path*',
        destination: 'http://localhost:3001/upload/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3001/auth/:path*',
      },
      {
        source: '/quiz/:path*',
        destination: 'http://localhost:3001/quiz/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

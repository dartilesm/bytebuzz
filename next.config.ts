import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  cacheComponents: true,
  serverExternalPackages: [
    "@logtail/pino",
    "thread-stream",
    "pino",
    "pino-worker",
    "pino-file",
    "pino-pretty",
  ],
  images: {
    remotePatterns: [
      {
        hostname: "github.com",
      },
      {
        hostname: "localhost",
      },
      {
        hostname: "bytebuzz.dev",
      },
      {
        hostname: "*.supabase.co",
      },
      {
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;

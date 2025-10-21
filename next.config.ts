import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: [
    "thread-stream",
    "pino-worker",
    "pino-file",
    "pino-pretty",
    "@logtail/pino",
  ],
  experimental: {
    devtoolSegmentExplorer: true,
  },
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
    ],
  },
};

export default nextConfig;

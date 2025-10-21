import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["pino", "@logtail/pino", "pino-pretty"],
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

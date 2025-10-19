import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    serverComponentsExternalPackages: ["pino", "pino-pretty"],
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
    ],
  },
};

export default nextConfig;

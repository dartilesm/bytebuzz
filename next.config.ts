import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  typedRoutes: true,
  cacheComponents: true,
  serverExternalPackages: ["thread-stream"],
  images: {
    remotePatterns: [
      {
        hostname: "github.com",
      },
      {
        hostname: "localhost",
      },
      {
        hostname: "*.supabase.co",
      },
      {
        hostname: "img.clerk.com",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;

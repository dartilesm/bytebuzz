import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  cacheComponents: true,
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
  },
};

export default nextConfig;

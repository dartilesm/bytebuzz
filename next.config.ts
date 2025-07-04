import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

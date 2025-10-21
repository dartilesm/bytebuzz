import type { NextConfig } from "next";
import { PinoWebpackPlugin } from "pino-webpack-plugin";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: [
    "thread-stream",
    "pino",
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
  webpack: (config) => {
    config.plugins.push(
      new PinoWebpackPlugin({
        transports: [
          "thread-stream",
          "pino",
          "pino-worker",
          "pino-file",
          "pino-pretty",
          "@logtail/pino",
        ],
      }),
    );

    return config;
  },
};

export default nextConfig;

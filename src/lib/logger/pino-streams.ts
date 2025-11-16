import type { StreamEntry } from "pino";
import { createConsoleStream } from "@/lib/logger/console-stream";
import { createLogtailStream } from "@/lib/logger/logtail-stream";

/**
 * Log level based on environment
 */
const logLevel = process.env.VERCEL_ENV === "production" ? "warn" : "debug";

/**
 * Pino streams configuration
 * Uses custom streams instead of worker-thread-based transports for Vercel compatibility
 * @returns {StreamEntry[]} Array of Pino stream configurations
 */
export function getPinoStreams(): StreamEntry[] {
  const isProduction = process.env.VERCEL_ENV === "production";

  if (isProduction) {
    return [
      {
        level: logLevel,
        stream: createLogtailStream(),
      },
      {
        level: logLevel,
        stream: createConsoleStream(),
      },
    ];
  }

  return [
    {
      level: logLevel,
      stream: createConsoleStream(),
    },
  ];
}

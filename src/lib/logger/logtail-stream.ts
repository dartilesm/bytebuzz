import type { DestinationStream } from "pino";
import { Logtail } from "@logtail/node";
import { writeToLogtail } from "./functions/write-to-logtail";

/**
 * Logtail client instance (singleton)
 */
let logtailClient: Logtail | null = null;
let exitHandlersSetup = false;

/**
 * Gets or creates the Logtail client instance
 * @returns {Logtail | null} Logtail client instance or null if not configured
 */
function getLogtailClient(): Logtail | null {
  if (logtailClient) {
    return logtailClient;
  }

  const sourceToken = process.env.NEXT_PUBLIC_BETTERSTACK_SOURCE_TOKEN;

  if (!sourceToken) {
    return null;
  }

  const endpoint = process.env.NEXT_PUBLIC_BETTERSTACK_ENDPOINT;

  logtailClient = new Logtail(sourceToken, {
    endpoint,
  });

  return logtailClient;
}


/**
 * Flushes logs on process exit (for serverless environments)
 * Only sets up exit handlers in Node.js runtime (not Edge Runtime)
 */
function setupExitFlush(): void {
  if (exitHandlersSetup || typeof process === "undefined") {
    return;
  }

  exitHandlersSetup = true;

  const flushOnExit = async () => {
    const client = getLogtailClient();
    if (client) {
      await client.flush();
    }
  };

  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("beforeExit", flushOnExit);
    process.on("SIGINT", flushOnExit);
    process.on("SIGTERM", flushOnExit);
  }
}

/**
 * Creates a Pino stream that sends logs to Logtail using @logtail/node
 * @returns {DestinationStream} Pino destination stream
 */
export function createLogtailStream(): DestinationStream {
  const client = getLogtailClient();

  if (!client) {
    return {
      write: () => {
        // No-op if no token configured
      },
    };
  }

  // Setup exit handlers for serverless environments
  setupExitFlush();

  return {
    write(logLine: string): void {
      try {
        const logData = JSON.parse(logLine) as Record<string, unknown>;
        writeToLogtail(client, logData);
      } catch (error) {
        console.error("Error parsing log line for Logtail:", error);
      }
    },
  };
}

import type { DestinationStream } from "pino";
import { Logtail } from "@logtail/node";

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
 * Converts Pino log level number to Logtail level method name
 * Maps fatal to error and trace to debug since Logtail doesn't have those specific methods
 * @param {number} level - Pino log level number
 * @returns {string} Logtail method name
 */
function pinoLevelToLogtailMethod(level: number): string {
  if (level >= 60) {
    return "error"; // fatal maps to error
  }
  if (level >= 50) {
    return "error";
  }
  if (level >= 40) {
    return "warn";
  }
  if (level >= 30) {
    return "info";
  }
  if (level >= 20) {
    return "debug";
  }
  return "debug"; // trace maps to debug
}

/**
 * Flushes logs on process exit (for serverless environments)
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

  process.on("beforeExit", flushOnExit);
  process.on("SIGINT", flushOnExit);
  process.on("SIGTERM", flushOnExit);
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
        const level = (logData.level as number) || 30;
        const msg = (logData.msg as string) || "";
        const method = pinoLevelToLogtailMethod(level);

        // Extract all fields except level and msg for context
        const context: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(logData)) {
          if (key !== "level" && key !== "msg") {
            context[key] = value;
          }
        }

        // Call the appropriate Logtail method
        if (method === "error") {
          client.error(msg, context).catch((error: unknown) => {
            console.error("Error sending error log to Logtail:", error);
          });
        } else if (method === "warn") {
          client.warn(msg, context).catch((error: unknown) => {
            console.error("Error sending warn log to Logtail:", error);
          });
        } else if (method === "info") {
          client.info(msg, context).catch((error: unknown) => {
            console.error("Error sending info log to Logtail:", error);
          });
        } else {
          // debug or trace
          client.debug(msg, context).catch((error: unknown) => {
            console.error("Error sending debug log to Logtail:", error);
          });
        }
      } catch (error) {
        console.error("Error parsing log line for Logtail:", error);
      }
    },
  };
}

import type { DestinationStream } from "pino";
import { getConsoleMethod } from "./functions/get-console-method";
import { writeToConsole } from "./functions/write-to-console";

/**
 * Formats a log entry for console output
 * @param {Record<string, unknown>} logData - Parsed log data
 * @returns {string} Formatted log string
 */
function formatLogForConsole(logData: Record<string, unknown>): string {
  const timestamp = new Date((logData.time as number) || Date.now()).toISOString();
  const level = logData.level as number;
  const msg = (logData.msg as string) || "";
  const levelName = getConsoleMethod(level);

  const parts = [`[${timestamp}]`, `[${levelName.toUpperCase()}]`, msg];

  const extraFields: string[] = [];
  for (const [key, value] of Object.entries(logData)) {
    if (!["time", "level", "msg", "pid", "hostname"].includes(key)) {
      extraFields.push(`${key}=${JSON.stringify(value)}`);
    }
  }

  if (extraFields.length > 0) {
    parts.push(extraFields.join(" "));
  }

  return parts.join(" ");
}

/**
 * Creates a Pino stream that writes logs to console
 * @returns {DestinationStream} Pino destination stream
 */
export function createConsoleStream(): DestinationStream {
  return {
    write(logLine: string): void {
      try {
        const logData = JSON.parse(logLine) as Record<string, unknown>;
        const formattedMessage = formatLogForConsole(logData);
        writeToConsole(logData, formattedMessage);
      } catch (error) {
        console.error("Error parsing log line for console:", error, logLine);
      }
    },
  };
}

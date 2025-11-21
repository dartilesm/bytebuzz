import type { DestinationStream } from "pino";
import { writeToConsole } from "./functions/write-to-console";

/**
 * Formats a log entry for console output
 * Returns only the message (which includes caller info prefix)
 * Format: functionName @ filePath:line → message
 * @param {Record<string, unknown>} logData - Parsed log data
 * @returns {string} Formatted log string
 */
function formatLogForConsole(logData: Record<string, unknown>): string {
  const msg = (logData.msg as string) || "";

  const extraFields: string[] = [];
  for (const [key, value] of Object.entries(logData)) {
    if (!["time", "level", "msg", "pid", "hostname"].includes(key)) {
      extraFields.push(`${key}=${JSON.stringify(value)}`);
    }
  }

  if (extraFields.length > 0) {
    return `${msg} ${extraFields.join(" ")}`;
  }

  return msg;
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

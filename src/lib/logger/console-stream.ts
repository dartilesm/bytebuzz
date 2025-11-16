import type { DestinationStream } from "pino";

/**
 * Converts Pino log level number to console method name
 * @param {number} level - Pino log level number
 * @returns {string} Console method name
 */
function getConsoleMethod(level: number): "log" | "warn" | "error" | "info" | "debug" {
  if (level >= 60) {
    return "error";
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
  return "log"; // trace
}

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
        const level = (logData.level as number) || 30;
        const consoleMethod = getConsoleMethod(level);
        const formattedMessage = formatLogForConsole(logData);

        console[consoleMethod](formattedMessage);
      } catch (error) {
        console.error("Error parsing log line for console:", error, logLine);
      }
    },
  };
}


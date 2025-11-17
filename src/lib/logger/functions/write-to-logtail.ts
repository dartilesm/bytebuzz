import type { Logtail } from "@logtail/node";
import { getConsoleMethod } from "./get-console-method";

function extractLogContext(logObj: Record<string, unknown>): Record<string, unknown> {
  const context: Record<string, unknown> = {};
  const excludedFields = ["level", "msg", "time", "pid", "hostname"];

  for (const [key, value] of Object.entries(logObj)) {
    if (!excludedFields.includes(key)) {
      context[key] = value;
    }
  }

  return context;
}

/**
 * Writes a log object to Logtail using the appropriate method based on log level
 * @param {Logtail} client - Logtail client instance
 * @param {Record<string, unknown>} logObj - Log object with level, msg, and other properties
 */
export function writeToLogtail(client: Logtail, logObj: Record<string, unknown>): void {
  const level = (logObj.level as number) || 30;
  const msg = (logObj.msg as string) || "";
  const context = extractLogContext(logObj);
  const method = getConsoleMethod(level);

  if (method === "error") {
    client.error(msg, context).catch((error: unknown) => {
      console.error("Error sending error log to Logtail:", error);
    });
    return;
  }

  if (method === "warn") {
    client.warn(msg, context).catch((error: unknown) => {
      console.error("Error sending warn log to Logtail:", error);
    });
    return;
  }

  if (method === "info") {
    client.info(msg, context).catch((error: unknown) => {
      console.error("Error sending info log to Logtail:", error);
    });
    return;
  }

  // debug or trace
  client.debug(msg, context).catch((error: unknown) => {
    console.error("Error sending debug log to Logtail:", error);
  });
}

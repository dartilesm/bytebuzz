import { getConsoleMethod } from "@/lib/logger/functions/get-console-method";

/**
 * Writes a log object to the console using the appropriate console method
 * Supports both formatted string output (server) and simple object output (browser)
 * @param {Record<string, unknown>} logObj - Log object with level, msg, and other properties
 * @param {string} [formattedMessage] - Optional formatted message string (for server-side formatted output)
 */
export function writeToConsole(logObj: Record<string, unknown>, formattedMessage?: string): void {
  const level = (logObj.level as number) || 30;
  const consoleMethod = getConsoleMethod(level);

  if (formattedMessage) {
    console[consoleMethod](formattedMessage);
    return;
  }

  const msg = (logObj.msg as string) || "";
  const { level: _level, msg: _msg, time: _time, ...rest } = logObj;
  console[consoleMethod](msg, rest);
}

/**
 * Converts Pino log level number to console method name
 * @param {number} level - Pino log level number
 * @returns {string} Console method name
 */
export function getConsoleMethod(level: number): "log" | "warn" | "error" | "info" | "debug" {
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
  return "log";
}

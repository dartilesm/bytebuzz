/**
 * Gets the appropriate log level based on environment
 * @returns {string} Log level ("warn" for production, "debug" for development)
 */
export function getLogLevel(): "warn" | "debug" {
  const isProduction = typeof process !== "undefined" && process.env.VERCEL_ENV === "production";

  if (isProduction) {
    return "warn";
  }

  return "debug";
}

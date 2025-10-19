import pino, { type Logger, type LogFn, type Level } from "pino";
import { getCallerInfo, type CallerInfo } from "@/lib/logger/logger-caller";

/**
 * Pino transport configuration for pretty printing
 */
const pinoTransport = { target: "pino-pretty", options: { colorize: true } };

/**
 * Pino logger instance configured based on environment
 * - Production: warn level only
 * - Development: debug level with pretty printing
 */
const pinoLogger: Logger =
  process.env["NODE_ENV"] === "production"
    ? pino({ level: "warn", transport: { ...pinoTransport } })
    : pino({
        level: "debug",
        transport: { ...pinoTransport },
      });

/**
 * Metadata object that can be passed to log functions
 */
type LogMetadata = Record<string, unknown>;

/**
 * Formats caller information into a readable string prefix
 * @param {CallerInfo | null} caller - The caller information to format
 * @returns {string} Formatted caller prefix or empty string
 */
function formatCallerPrefix(caller: CallerInfo | null): string {
  if (!caller) {
    return "";
  }

  return `<${caller.functionName} (${caller.filePath}:${caller.line}:${caller.col})>`;
}

/**
 * Logs a message with caller information automatically extracted from stack trace
 * @param {Level} level - The log level to use
 * @param {string} msg - The message to log
 * @param {LogMetadata} [meta] - Optional metadata to include in the log
 */
function logWithCaller(level: Level, msg: string, meta?: LogMetadata): void {
  const caller = getCallerInfo();
  const prefix = formatCallerPrefix(caller);

  if (!pinoLogger[level as keyof typeof pinoLogger]) {
    return;
  }

  const logFn = (pinoLogger[level as keyof typeof pinoLogger] as LogFn).bind(pinoLogger);

  // Pino best practice: metadata as first arg, message as 'msg' property
  // Only include metadata if provided, don't add caller to metadata as it's already in the prefix
  if (meta && Object.keys(meta).length > 0) {
    logFn(meta, `${prefix}: ${msg}`);
  } else {
    logFn(`${prefix}: ${msg}`);
  }
}

/**
 * Logger interface with methods for different log levels
 * All methods automatically capture caller information from stack trace
 */
export const log = {
  /**
   * Logs an informational message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  info: (msg: string, meta?: LogMetadata) => logWithCaller("info", msg, meta),

  /**
   * Logs a warning message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  warn: (msg: string, meta?: LogMetadata) => logWithCaller("warn", msg, meta),

  /**
   * Logs an error message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  error: (msg: string, meta?: LogMetadata) => logWithCaller("error", msg, meta),

  /**
   * Logs a debug message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  debug: (msg: string, meta?: LogMetadata) => logWithCaller("debug", msg, meta),

  /**
   * Logs a fatal message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  fatal: (msg: string, meta?: LogMetadata) => logWithCaller("fatal", msg, meta),

  /**
   * Logs a trace message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  trace: (msg: string, meta?: LogMetadata) => logWithCaller("trace", msg, meta),

  /**
   * Logs a child logger
   * @param {string} name - The name of the child logger
   * @returns {Logger} The child logger
   */
  child: (name: string) => pinoLogger.child({ name }),
};

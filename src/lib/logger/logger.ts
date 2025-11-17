import { getCallerInfo, type CallerInfo } from "@/lib/logger/logger-caller";
import pino, { type Level, type LogFn, type Logger } from "pino";
import { getPinoStreams } from "@/lib/logger/pino-streams";
import { writeToConsole } from "@/lib/logger/functions/write-to-console";
import { getLogLevel } from "@/lib/logger/functions/get-log-level";

let loggerInstance: Logger | null = null;

/**
 * Creates a logger instance
 * Detects environment and uses appropriate Pino configuration:
 * - Browser: Uses Pino browser API (console methods)
 * - Node.js: Uses multistream with Logtail and console streams
 * @returns {Logger} The logger instance
 */
function createLoggerInstance(): Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  const logLevel = getLogLevel();
  const hasMultistream = typeof pino.multistream === "function";
  const isBrowser = typeof window !== "undefined";

  if (isBrowser || !hasMultistream) {
    // Browser environment: Use Pino browser API
    loggerInstance = pino({
      level: logLevel,
      browser: {
        asObject: true,
        serialize: true,
        write: (o: object) => {
          const logObj = o as Record<string, unknown>;
          writeToConsole(logObj);
        },
      },
    });
    return loggerInstance;
  }

  // Node.js environment: Use multistream with Logtail and console
  const streams = getPinoStreams();
  loggerInstance = pino({ level: logLevel }, pino.multistream(streams));
  return loggerInstance;
}

/**
 * Metadata object that can be passed to log functions
 */
type LogMetadata = Record<string, unknown>;

/**
 * Formats caller information into a readable string prefix
 * Format: functionName @ filePath:line →
 * @param {CallerInfo | null} caller - The caller information to format
 * @returns {string} Formatted caller prefix or empty string
 */
function formatCallerPrefix(caller: CallerInfo | null): string {
  if (!caller) {
    return "";
  }

  return `${caller.functionName} @ ${caller.filePath}:${caller.line} →`;
}

/**
 * Logs a message with caller information automatically extracted from stack trace
 * @param {Level} level - The log level to use
 * @param {string} msg - The message to log
 * @param {LogMetadata} [meta] - Optional metadata to include in the log
 */
function logWithCaller(
  level: Level,
  msg: string,
  meta?: LogMetadata,
  caller?: CallerInfo | null
): void {
  const callerInfo = caller === undefined ? getCallerInfo() : caller;
  const prefix = formatCallerPrefix(callerInfo);

  const pinoLogger = createLoggerInstance();

  if (!pinoLogger[level as keyof typeof pinoLogger]) {
    return;
  }

  const logFn = (pinoLogger[level as keyof typeof pinoLogger] as LogFn).bind(pinoLogger);

  const logMessage = prefix ? `${prefix} ${msg}` : msg;

  // Pino best practice: metadata as first arg, message as 'msg' property
  // Only include metadata if provided, don't add caller to metadata as it's already in the prefix
  if (meta && Object.keys(meta).length > 0) {
    logFn(meta, logMessage);
  } else {
    logFn(logMessage);
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
  info: (msg: string, meta?: LogMetadata, caller?: CallerInfo | null) =>
    logWithCaller("info", msg, meta, caller),

  /**
   * Logs a warning message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  warn: (msg: string, meta?: LogMetadata, caller?: CallerInfo | null) =>
    logWithCaller("warn", msg, meta, caller),

  /**
   * Logs an error message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  error: (msg: string, meta?: LogMetadata, caller?: CallerInfo | null) =>
    logWithCaller("error", msg, meta, caller),

  /**
   * Logs a debug message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  debug: (msg: string, meta?: LogMetadata, caller?: CallerInfo | null) =>
    logWithCaller("debug", msg, meta, caller),

  /**
   * Logs a fatal message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  fatal: (msg: string, meta?: LogMetadata, caller?: CallerInfo | null) =>
    logWithCaller("fatal", msg, meta, caller),

  /**
   * Logs a trace message
   * @param {string} msg - The message to log
   * @param {LogMetadata} [meta] - Optional metadata to include
   */
  trace: (msg: string, meta?: LogMetadata, caller?: CallerInfo) =>
    logWithCaller("trace", msg, meta, caller),

  /**
   * Logs a child logger
   * @param {string} name - The name of the child logger
   * @returns {Logger} The child logger
   */
  child: (name: string) => createLoggerInstance().child({ name }),
};

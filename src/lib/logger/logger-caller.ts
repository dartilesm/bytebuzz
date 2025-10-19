/**
 * Type representing caller information extracted from stack trace
 */
export type CallerInfo = {
  functionName: string;
  filePath: string;
  line: string;
  col: string;
};

/**
 * Exclude files from the stack trace
 * These files are internal to the logger and should not be included in the caller info
 * @type {string[]}
 */
const LOGGER_INTERNAL_FILES = [
  "logger.ts",
  "logger-caller.ts",
  "getCallerInfo",
  "logWithCaller",
  "Object.info",
  "Object.warn",
  "Object.error",
  "Object.debug",
] as const;

/**
 * Default fallback frame index when no valid frame is found
 */
const DEFAULT_FALLBACK_FRAME_INDEX = 6;

/**
 * Checks if a stack frame line should be skipped
 * @param {string} line - Stack frame line to check
 * @returns {boolean} True if the frame should be skipped
 */
function shouldSkipFrame(line: string): boolean {
  if (!line.includes(" at ")) {
    return true;
  }

  return LOGGER_INTERNAL_FILES.some((file) => line.includes(file));
}

/**
 * Parses a stack frame with function name format
 * Example: '    at Home (/path/to/file.js:313:129)'
 * @param {string} frame - Stack frame to parse
 * @returns {CallerInfo | null} Parsed caller info or null if parsing fails
 */
function parseFrameWithFunction(frame: string): CallerInfo | null {
  const match = frame.match(/at\s+(\S+)\s+\(([^:]+):(\d+):(\d+)\)/);

  if (!match) {
    return null;
  }

  const [, functionName, filePath, line, col] = match;

  return {
    functionName,
    filePath,
    line,
    col,
  };
}

/**
 * Parses a stack frame without function name format
 * Example: '    at /path/to/file.js:313:129'
 * @param {string} frame - Stack frame to parse
 * @returns {CallerInfo | null} Parsed caller info or null if parsing fails
 */
function parseFrameWithoutFunction(frame: string): CallerInfo | null {
  const match = frame.match(/at\s+([^:]+):(\d+):(\d+)/);

  if (!match) {
    return null;
  }

  const [, filePath, line, col] = match;

  return {
    functionName: "<anonymous>",
    filePath,
    line,
    col,
  };
}

/**
 * Finds the first valid stack frame outside logger internal files
 * @param {string[]} stack - Array of stack frame strings
 * @returns {string | undefined} First valid frame or undefined if none found
 */
function findValidFrame(stack: string[]): string | undefined {
  for (const line of stack) {
    if (!shouldSkipFrame(line)) {
      return line;
    }
  }

  return undefined;
}

/**
 * Extracts caller information from the current stack trace in Node.js environment
 * @returns {CallerInfo | null} Caller information or null if unable to extract
 */
function getCallerInfoServer(): CallerInfo | null {
  const err = new Error();
  const stack = err.stack?.split("\n");

  if (!stack || stack.length === 0) {
    return null;
  }

  const frame = findValidFrame(stack) ?? stack[DEFAULT_FALLBACK_FRAME_INDEX] ?? stack[0];

  if (!frame) {
    return null;
  }

  // Try parsing with function name first
  const parsedWithFunction = parseFrameWithFunction(frame);
  if (parsedWithFunction) {
    return parsedWithFunction;
  }

  // Fallback to parsing without function name
  return parseFrameWithoutFunction(frame);
}

/**
 * Returns placeholder caller information for browser environment
 * Stack traces in browsers are not reliable for extracting caller info
 * @returns {CallerInfo} Placeholder caller info for client
 */
function getCallerInfoClient(): CallerInfo {
  return {
    functionName: "<client>",
    filePath: "<browser>",
    line: "0",
    col: "0",
  };
}

/**
 * Extracts caller information from the current stack trace
 * Automatically detects environment (browser vs Node.js) and uses appropriate method
 * @returns {CallerInfo | null} Caller information or null if unable to extract
 */
export function getCallerInfo(): CallerInfo | null {
  if (typeof window !== "undefined") {
    return getCallerInfoClient();
  }

  return getCallerInfoServer();
}

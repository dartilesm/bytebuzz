import pino, { type Logger } from "pino";
import path from "path";

const rootDir = process.cwd();

const pinoLogger: Logger =
  process.env["NODE_ENV"] === "production"
    ? // JSON in production
      pino({ level: "warn" })
    : // Pretty print in development
      pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: "debug",
      });

function getCallerFile(): string | undefined {
  const err = new Error();
  const stack = err.stack?.split("\n");
  if (!stack) return undefined;
  // stack[0] is 'Error', stack[1] is this function, stack[2] is getLogger, stack[3] is the caller
  const callerLine = stack[3] || stack[2];
  const match = callerLine.match(/\((.*):\d+:\d+\)/) || callerLine.match(/at (.*):\d+:\d+/);
  if (match && match[1]) {
    return match[1];
  }
  return undefined;
}

function getSrcCallerFile(): string | undefined {
  const err = new Error();
  const stack = err.stack?.split("\n");
  if (!stack) return undefined;
  // Look for the first stack line that includes '/src/'
  for (const line of stack) {
    const match = line.match(/\((.*):\d+:\d+\)/) || line.match(/at (.*):\d+:\d+/);
    if (match && match[1] && match[1].includes("/src/")) {
      return match[1];
    }
  }
  return undefined;
}

export const getLogger = (filePath?: string): Logger => {
  let modulePath = filePath;
  if (!modulePath) {
    if (process.env.NODE_ENV !== "production") {
      const srcCaller = getSrcCallerFile();
      if (srcCaller) {
        modulePath = path.relative(rootDir, srcCaller).replace(/\\/g, "/");
      }
    }
    if (!modulePath) {
      const caller = getCallerFile();
      if (caller) {
        modulePath = path.relative(rootDir, caller).replace(/\\/g, "/");
      }
    }
  }
  return pinoLogger.child({ module: modulePath || "unknown" });
};

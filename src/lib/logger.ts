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

export const getLogger = (filePath: string): Logger => {
  const modulePath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  return pinoLogger.child({ module: modulePath });
};

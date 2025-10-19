import pino, { type Logger } from "pino";
import pinoCaller from "pino-caller";

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

export const log = pinoCaller(pinoLogger);

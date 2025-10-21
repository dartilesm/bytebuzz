/**
 * Pino transport configuration for all transports
 * @returns {pino.Transport} Pino transport configuration for all transports
 */
const pinoBetterstackTransport = {
  target: "@logtail/pino",
  level: process.env.VERCEL_ENV === "production" ? "warn" : "debug",
  options: {
    sourceToken: process.env.NEXT_PUBLIC_BETTERSTACK_SOURCE_TOKEN,
    options: {
      endpoint: process.env.NEXT_PUBLIC_BETTERSTACK_ENDPOINT,
    },
  },
};

/**
 * Pino transport configuration for pretty printing
 * @returns {pino.Transport} Pino transport configuration for pretty printing
 */
const pinoPrettyTransport = {
  target: "pino-pretty",
  level: process.env.VERCEL_ENV === "production" ? "warn" : "debug",
  options: {
    colorize: true,
  },
};

/**
 * Pino transport configuration for all transports
 * @returns {pino.Transport} Pino transport configuration for all transports
 */
export const pinoTransports = {
  targets: [pinoBetterstackTransport, pinoPrettyTransport],
};

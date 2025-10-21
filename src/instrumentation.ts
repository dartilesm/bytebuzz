import { log } from "@/lib/logger/logger";
import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  log.error("Fetch error", { err, request, context }, null);
};

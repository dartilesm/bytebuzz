import { log } from "@/lib/logger/logger";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

const SUPABASE_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const response = await fetch(input, init);
    // You might want to log successful responses or specific status codes here as well
    if (!response.ok) {
      // Clone the response to read the body for logging without consuming it
      const clonedResponse = response.clone();
      const errorMessage = await clonedResponse.text();
      const path = response.url.replace(`${SUPABASE_BASE_URL}/rest/v1/`, "");
      try {
        log.error(`Supabase error at ${path}: ${response.status} ${response.statusText} `, {
          ...JSON.parse(errorMessage),
        });
      } catch {
        log.error(`Supabase error at ${path}: ${response.status} ${response.statusText} `, {
          message: errorMessage,
        });
      }
    }
    return response;
  } catch (error) {
    log.error("Custom fetch network error:", { error });
    throw error; // Re-throw the error so supabase-js can also handle it
  }
}

/**
 * Creates a server-side Supabase client
 * @param options - Configuration options
 * @param options.accessToken - Optional Clerk token for authentication, useful in cached environment
 * @param options.needsAuth - Whether authentication is required (default: true)
 * @returns Supabase client
 */
export function createServerSupabaseClient({
  accessToken: clerkToken,
}: {
  accessToken?: string | null;
} = {}) {
  async function accessToken() {
    if (clerkToken) return clerkToken;

    const session = await auth();
    return session.getToken();
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      accessToken,
      global: {
        fetch: supabaseFetch,
      },
    }
  );
}

/**
 * Creates an admin Supabase client
 * @returns Admin Supabase client
 */
export function createAdminSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    global: {
      fetch: supabaseFetch,
    },
  });
}

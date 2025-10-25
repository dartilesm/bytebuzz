import { log } from "@/lib/logger/logger";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const response = await fetch(input, init);
    // You might want to log successful responses or specific status codes here as well
    if (!response.ok) {
      const errorMessage = await response.text();
      log.error(`Supabase error: ${response.status} ${response.statusText}`, {
        ...JSON.parse(errorMessage),
      });
    }
    return response;
  } catch (error) {
    log.error("Custom fetch network error:", { error });
    throw error; // Re-throw the error so supabase-js can also handle it
  }
}

/**
 * Creates a server-side Supabase client
 * @returns Supabase client
 */
export function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
      global: {
        fetch: supabaseFetch,
      },
    },
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

/**
 * Gets the authentication token from Clerk
 * Call this OUTSIDE of any "use cache" functions and pass the result to createCachedSupabaseClient
 * @returns Authentication token or null
 */
export async function getSupabaseAuth() {
  return (await auth()).getToken();
}

/**
 * Creates a Supabase client suitable for use inside "use cache" functions
 * Does NOT call headers() or auth() internally, making it safe for cached functions
 * 
 * @param accessToken - The authentication token obtained from getSupabaseAuth()
 * @returns Supabase client configured with the provided token
 * 
 * @example
 * // Outside the cached function
 * const token = await getSupabaseAuth();
 * 
 * // Inside the cached function
 * async function getCachedData(token: string | null) {
 *   "use cache";
 *   const supabase = createCachedSupabaseClient(token);
 *   return supabase.from('table').select();
 * }
 */
export function createCachedSupabaseClient(accessToken: string | null) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        fetch: supabaseFetch,
      },
    },
  );
}

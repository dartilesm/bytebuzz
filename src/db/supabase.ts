import { log } from "@/lib/logger/logger";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
      global: {
        fetch: async (input, init) => {
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
        },
      },
    },
  );
}

export function createUnauthenticatedSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function createAdminSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
}

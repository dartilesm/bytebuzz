import { createServerSupabaseClient } from "@/db/supabase";
import { cache } from "react";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Standard result type for all database operations
 */
export type DbResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

/**
 * Standard result type for storage operations
 */
export type StorageResult = {
  error: Error | null;
};

/**
 * Get Supabase client instance for server-side operations
 */
export function getSupabaseClient() {
  return createServerSupabaseClient();
}

/**
 * Wraps a query function with React cache for automatic deduplication
 * Use this for all READ operations that should be cached during a request
 * Do NOT use this for mutations (INSERT, UPDATE, DELETE)
 * 
 * @param fn - The function to cache
 * @returns Cached version of the function
 * 
 * @example
 * ```typescript
 * const getUserById = cached(async (id: string) => {
 *   const supabase = createServerSupabaseClient();
 *   return await supabase.from("users").select("*").eq("id", id).single();
 * });
 * ```
 */
export function cached<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return cache(fn) as T;
}

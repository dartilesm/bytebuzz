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
 * Base repository class with automatic caching for GET operations
 * All repositories should extend this class to get consistent behavior
 * 
 * @example
 * ```typescript
 * class UserRepository extends BaseRepository {
 *   getUser = this.cached(async (id: string) => {
 *     return await this.supabase.from("users").select("*").eq("id", id).single();
 *   });
 * }
 * ```
 */
export abstract class BaseRepository {
  protected supabase = createServerSupabaseClient();

  /**
   * Wraps a query function with React cache for automatic deduplication
   * Use this for all READ operations that should be cached during a request
   * Do NOT use this for mutations (INSERT, UPDATE, DELETE)
   * 
   * @param fn - The function to cache
   * @returns Cached version of the function
   */
  protected cached<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return cache(fn.bind(this)) as T;
  }
}

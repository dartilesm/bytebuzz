import { createCachedSupabaseClient, createServerSupabaseClient, getSupabaseAuth } from "@/db/supabase";
import { ServiceMethods, ServiceName } from "@/types/services";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";
import { postService } from "@/lib/db/services/post.service";
import { userService } from "@/lib/db/services/user.service";
import { mediaService } from "@/lib/db/services/media.service";
import { reactionService } from "@/lib/db/services/reaction.service";

const services = {
    postService,
    userService,
    mediaService,
    reactionService,
} as const;

type ServiceMethod<TParams, TReturn> = (
  supabase: SupabaseClient<Database>,
  params: TParams,
) => Promise<TReturn>;

/**
 * Wraps a service method with caching support.
 * Automatically handles auth token fetching and supabase client creation for cached functions.
 * 
 * @param serviceMethod - Service method that accepts (supabase, params)
 * @returns Object with cached and uncached versions of the method
 * 
 * @example
 * ```typescript
 * // In post.service.ts
 * async function getUserFeed(supabase: SupabaseClient<Database>, cursor?: string) {
 *   let query = supabase.rpc("get_user_feed").order("created_at", { ascending: false }).limit(10);
 *   if (cursor) query = query.lt("created_at", cursor);
 *   return await query.overrideTypes<NestedPost[]>();
 * }
 * 
 * export const getUserFeedCached = withCache(getUserFeed);
 * 
 * // In component
 * const { data, error } = await getUserFeedCached({ cursor: "2024-01-01" });
 * ```
 */
export function withCache<TParams = void, TReturn = unknown>(
  serviceMethod: ServiceMethod<TParams, TReturn>,
) {
  // Cached version - uses "use cache" directive
  async function cachedMethod(accessToken: string | null, params: TParams) {
    "use cache";
    const supabase = createCachedSupabaseClient(accessToken);
    return await serviceMethod(supabase, params);
  }

  // Main function that users call - handles auth token fetching
  return async function (params?: TParams) {
    const accessToken = await getSupabaseAuth();
    return await cachedMethod(accessToken, params as TParams);
  };
}


export function withCacheService<T extends ServiceName>(service: T, method: ServiceMethods<T>) {
    async function cachedService(accessToken: string | null, params) {
        "use cache";
        const supabase = createCachedSupabaseClient(accessToken);
        return services[service][method].bind({ supabase })(params);
    }

    return async function serviceCall(params?: any) {
        const accessToken = await getSupabaseAuth();
        return cachedService(accessToken, params);

    }
}
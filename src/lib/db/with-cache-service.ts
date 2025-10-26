import type { ServiceMethodWithContext } from "@/lib/create-service-with-context";
import { mediaService } from "@/lib/db/services/media.service";
import { postService } from "@/lib/db/services/post.service";
import { reactionService } from "@/lib/db/services/reaction.service";
import { userService } from "@/lib/db/services/user.service";
import type { ServiceMethodParams, ServiceMethods, ServiceName } from "@/types/services";
import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

const services = {
  postService,
  userService,
  mediaService,
  reactionService,
};

/**
 * Defining the cache life profile alternatives since
 * it's hard to infer all the possible values from the cacheLife function.
 *
 * @see https://nextjs.org/docs/app/building-your-application/caching/cache-life
 */
type CacheLifeProfile =
  | "default"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "max"
  | {
      stale?: number;
      revalidate?: number;
      expire?: number;
    };

type CacheSettings = {
  cacheLife?: CacheLifeProfile;
  cacheTags?: string[];
};

/**
 * HOF that wraps a service method with caching functionality.
 *
 * @param service - The service to call
 * @param method - The method to call
 * @param cacheSettings - The cache settings to use
 * @returns The cached service
 */
export function withCacheService<T extends ServiceName, M extends ServiceMethods<T>>(
  service: T,
  method: M,
  cacheSettings: CacheSettings = {}
) {
  async function cachedService(accessToken: string | null, ...params: ServiceMethodParams<T, M>) {
    "use cache";
    if (cacheSettings.cacheLife) {
      cacheLife(cacheSettings.cacheLife as never);
    }
    if (cacheSettings.cacheTags) {
      cacheTag(...cacheSettings.cacheTags);
    }

    const serviceFunction = services[service][method] as ServiceMethodWithContext;

    return serviceFunction.call({ accessToken }, ...params);
  }

  return async function serviceCall(...params: ServiceMethodParams<T, M>) {
    const session = await auth();
    const accessToken = await session.getToken();
    return cachedService(accessToken, ...params);
  };
}

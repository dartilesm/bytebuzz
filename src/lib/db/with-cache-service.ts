import { mediaService } from "@/lib/db/services/media.service";
import { postService } from "@/lib/db/services/post.service";
import { reactionService } from "@/lib/db/services/reaction.service";
import { userService } from "@/lib/db/services/user.service";
import { ServiceMethodParams, ServiceMethods, ServiceName } from "@/types/services";
import { auth } from "@clerk/nextjs/server";

const services = {
  postService,
  userService,
  mediaService,
  reactionService,
} as const;

export function withCacheService<T extends ServiceName, M extends ServiceMethods<T>>(
  service: T,
  method: M
) {
  async function cachedService(accessToken: string | null, ...params: ServiceMethodParams<T, M>) {
    "use cache";

    const serviceFunction = services[service][method] as Function;
    return serviceFunction.call({ accessToken }, ...params);
  }

  return async function serviceCall(...params: ServiceMethodParams<T, M>) {
    const session = await auth();
    const accessToken = await session.getToken();
    return cachedService(accessToken, ...params);
  };
}

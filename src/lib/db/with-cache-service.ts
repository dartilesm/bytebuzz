import { createServerSupabaseClient } from "@/db/supabase";
import { mediaService } from "@/lib/db/services/media.service";
import { postService } from "@/lib/db/services/post.service";
import { reactionService } from "@/lib/db/services/reaction.service";
import { userService } from "@/lib/db/services/user.service";
import { auth } from "@clerk/nextjs/server";

const services = {
    postService,
    userService,
    mediaService,
    reactionService,
} as const;

type ServiceName = keyof typeof services;
type ServiceMethods<T extends ServiceName> = keyof (typeof services)[T];

type ServiceMethodParams<T extends ServiceName, M extends ServiceMethods<T>> = Parameters<(typeof services)[T][M] extends (...args: any[]) => any ? (typeof services)[T][M] : never>;

export function withCacheService<T extends ServiceName, M extends ServiceMethods<T>>(
    service: T, 
    method: M
) {

        async function cachedService(accessToken: string | null, ...params: ServiceMethodParams<T, M>) {
                "use cache";
                const supabase = createServerSupabaseClient(accessToken);
                const serviceFunction = services[service][method] as Function;

                return serviceFunction.call({ supabase }, ...params);
        }

        return async function serviceCall(
                ...params: ServiceMethodParams<T, M>
        ) {
                const session = await auth();
                const accessToken = await session.getToken();
                return cachedService(accessToken, ...params);
        }
}
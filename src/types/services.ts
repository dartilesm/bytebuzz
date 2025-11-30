/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MediaService } from "@/lib/db/services/media.service";
import type { PostService } from "@/lib/db/services/post.service";
import type { ReactionService } from "@/lib/db/services/reaction.service";
import type { UserService } from "@/lib/db/services/user.service";

export type Services = {
  postService: PostService;
  userService: UserService;
  mediaService: MediaService;
  reactionService: ReactionService;
};

export type ServiceName = keyof Services;
export type ServiceMethods<T extends ServiceName> = keyof Services[T];

export type ServiceMethodParams<T extends ServiceName, M extends ServiceMethods<T>> = Parameters<
  Services[T][M] extends (...args: any[]) => any ? Services[T][M] : never
>;

export type ServiceContext = {
  accessToken?: string | null;
};

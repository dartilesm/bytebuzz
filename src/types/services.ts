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

export type ServiceName = keyof typeof services;
export type ServiceMethods<T extends ServiceName> = keyof (typeof services)[T];
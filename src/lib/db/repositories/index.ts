/**
 * Central export point for all repositories
 * Use this for clean imports throughout your application
 * 
 * @example
 * ```typescript
 * import { postRepository, userRepository } from "@/lib/db/repositories";
 * 
 * const { data } = await postRepository.getUserFeed();
 * const { data: user } = await userRepository.getUserByUsername("john");
 * ```
 */

export { postRepository } from "./post.repository";
export { mediaRepository } from "./media.repository";
export { userRepository } from "./user.repository";
export { BaseRepository } from "./base.repository";
export type { DbResult, StorageResult } from "./base.repository";
export type { MediaRecord } from "./media.repository";

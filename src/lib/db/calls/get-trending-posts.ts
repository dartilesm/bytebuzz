import { postRepository } from "@/lib/db/repositories";

type GetTrendingPostsParams = {
  limitCount?: number;
  offsetCount?: number;
};

/**
 * Get trending posts with automatic caching via repository
 * @deprecated Use postRepository.getTrendingPosts() directly instead
 */
export const getCachedTrendingPosts = async (params?: GetTrendingPostsParams) => {
  return await postRepository.getTrendingPosts(params);
};

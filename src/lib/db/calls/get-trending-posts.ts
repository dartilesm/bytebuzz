import { createServerSupabaseClient } from "@/db/supabase";
import { cache } from "react";

type GetTrendingPostsParams = {
  limitCount?: number;
  offsetCount?: number;
};

export const getCachedTrendingPosts = cache(getTrendingPosts);

async function getTrendingPosts({ limitCount = 10, offsetCount = 0 }: GetTrendingPostsParams = {}) {
  const supabaseClient = createServerSupabaseClient();
  const trendingPosts = await supabaseClient.rpc("get_trending_posts", {
    limit_count: limitCount,
    offset_count: offsetCount,
  });
  return trendingPosts;
}

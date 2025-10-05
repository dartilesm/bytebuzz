import { createServerSupabaseClient } from "@/db/supabase";
import { cache } from "react";

type GetTrendingUsersParams = {
  limitCount?: number;
  offsetCount?: number;
};

export const getCachedTrendingUsers = cache(getTrendingUsers);

async function getTrendingUsers({ limitCount = 10, offsetCount = 0 }: GetTrendingUsersParams = {}) {
  const supabaseClient = createServerSupabaseClient();
  const trendingUsers = await supabaseClient.rpc("get_trending_users", {
    limit_count: limitCount,
    offset_count: offsetCount,
  });
  return trendingUsers;
}

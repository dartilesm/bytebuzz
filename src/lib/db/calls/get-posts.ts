import { createServerSupabaseClient } from "@/db/supabase";
import type { Database } from "database.types";
import { cache } from "react";

type SearchPostsArgs = Database["public"]["Functions"]["search_posts"]["Args"];

type GetPostsParams = {
  searchTerm: SearchPostsArgs["search_term"];
  limitCount?: SearchPostsArgs["limit_count"];
  offsetCount?: SearchPostsArgs["offset_count"];
};

export const getCachedPosts = cache(getPosts);

async function getPosts({ searchTerm, limitCount = 10, offsetCount = 0 }: GetPostsParams) {
  const supabaseClient = createServerSupabaseClient();
  const posts = await supabaseClient.rpc("search_posts", {
    search_term: searchTerm,
    limit_count: limitCount,
    offset_count: offsetCount,
  });
  return posts;
}

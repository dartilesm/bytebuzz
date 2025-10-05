import { createServerSupabaseClient } from "@/db/supabase";
import { cache } from "react";

export const getCachedPosts = cache(getPosts);

async function getPosts(searchTerm: string, limitCount: number = 10) {
  const supabaseClient = createServerSupabaseClient();
  const posts = await supabaseClient.rpc("search_posts", {
    search_term: searchTerm,
    limit_count: limitCount,
  });
  return posts;
}

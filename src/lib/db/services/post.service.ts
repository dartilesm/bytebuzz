import { createServerSupabaseClient } from "@/db/supabase";
import { createServiceWithContext } from "@/lib/create-service-with-context";
import type { NestedPost } from "@/types/nested-posts";
import type { ServiceContext } from "@/types/services";
import type { Tables } from "database.types";

/**
 * Get user feed
 * @param supabase - Supabase client (injected when using withCache)
 * @param cursor - Optional timestamp to fetch posts before this point
 */
async function getUserFeed(this: ServiceContext, cursor?: string) {
  const supabase = createServerSupabaseClient(this.accessToken);
  let query = supabase.rpc("get_user_feed").order("created_at", { ascending: false }).limit(10);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  return await query.overrideTypes<NestedPost[]>();
}

/**
 * Get posts by username
 * @param username - The username to fetch posts for
 * @param cursor - Optional timestamp to fetch posts before this point
 */
async function getUserPosts(
  this: ServiceContext,
  { username, cursor }: { username: string; cursor?: string }
) {
  const supabase = createServerSupabaseClient(this.accessToken);
  let query = supabase
    .rpc("get_user_posts_by_username", { input_username: username })
    .order("created_at", { ascending: false })
    .limit(10);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  return await query.overrideTypes<NestedPost[]>();
}

/**
 * Get trending posts
 * @param limitCount - Maximum number of posts to return (default: 10)
 * @param offsetCount - Number of posts to skip (default: 0)
 */
async function getTrendingPosts(
  this: ServiceContext,
  {
    limitCount = 10,
    offsetCount = 0,
  }: {
    limitCount?: number;
    offsetCount?: number;
  } = {}
) {
  const supabase = createServerSupabaseClient(this.accessToken);
  return await supabase.rpc("get_trending_posts", {
    limit_count: limitCount,
    offset_count: offsetCount,
  });
}

/**
 * Search posts
 * @param searchTerm - The search term to filter posts
 * @param limitCount - Maximum number of posts to return (default: 10)
 * @param offsetCount - Number of posts to skip (default: 0)
 */
async function searchPosts(
  this: ServiceContext,
  {
    searchTerm,
    limitCount = 10,
    offsetCount = 0,
  }: {
    searchTerm: string;
    limitCount?: number;
    offsetCount?: number;
  }
) {
  const supabase = createServerSupabaseClient(this.accessToken);
  return await supabase.rpc("search_posts", {
    search_term: searchTerm,
    limit_count: limitCount,
    offset_count: offsetCount,
  });
}

/**
 * Create a new post (no caching for mutations)
 * @param data - Post data to insert
 */
async function createPost(
  this: ServiceContext,
  data: Pick<Tables<"posts">, "content" | "user_id"> &
    Partial<Pick<Tables<"posts">, "parent_post_id" | "repost_post_id">>
) {
  const supabase = createServerSupabaseClient(this.accessToken);
  return await supabase.from("posts").insert(data).select().single();
}

/**
 * Delete a post (no caching for mutations)
 * @param postId - ID of the post to delete
 */
async function deletePost(this: ServiceContext, postId: string) {
  const supabase = createServerSupabaseClient(this.accessToken);
  return await supabase.from("posts").delete().eq("id", postId);
}

/**
 * Get a single post by ID
 * @param postId - ID of the post to retrieve
 */
async function getPostById(this: ServiceContext, postId: string) {
  const supabase = createServerSupabaseClient(this.accessToken);
  return await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single()
    .overrideTypes<NestedPost>();
}

/**
 * Post service for all post-related database operations
 *
 * @example
 * ```typescript
 * import { postService } from "@/lib/db/services/post.service";
 *
 * const { data, error } = await postService.getUserFeed();
 * await postService.createPost({ content, user_id });
 * ```
 */
export const postService = createServiceWithContext({
  getUserFeed,
  getUserPosts,
  getTrendingPosts,
  searchPosts,
  createPost,
  deletePost,
  getPostById,
});

export type PostService = typeof postService;

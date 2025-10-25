import { createServerSupabaseClient } from "@/db/supabase";
import type { NestedPost } from "@/types/nested-posts";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Tables } from "database.types";
import { cached } from "./base.service";

/**
 * Get user feed with automatic caching
 * @param cursor - Optional timestamp to fetch posts before this point
 */
const getUserFeed = cached(
  async (cursor?: string): Promise<PostgrestSingleResponse<NestedPost[]>> => {
    const supabase = createServerSupabaseClient();
    let query = supabase
      .rpc("get_user_feed")
      .order("created_at", { ascending: false })
      .limit(10);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    return await query.overrideTypes<NestedPost[]>();
  }
);

/**
 * Get posts by username with automatic caching
 * @param username - The username to fetch posts for
 * @param cursor - Optional timestamp to fetch posts before this point
 */
const getUserPosts = cached(
  async ({
    username,
    cursor,
  }: {
    username: string;
    cursor?: string;
  }): Promise<PostgrestSingleResponse<NestedPost[]>> => {
    const supabase = createServerSupabaseClient();
    let query = supabase
      .rpc("get_user_posts_by_username", { input_username: username })
      .order("created_at", { ascending: false })
      .limit(10);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    return await query.overrideTypes<NestedPost[]>();
  }
);

/**
 * Get trending posts with automatic caching
 * @param limitCount - Maximum number of posts to return (default: 10)
 * @param offsetCount - Number of posts to skip (default: 0)
 */
const getTrendingPosts = cached(
  async ({
    limitCount = 10,
    offsetCount = 0,
  }: {
    limitCount?: number;
    offsetCount?: number;
  } = {}): Promise<PostgrestSingleResponse<any>> => {
    const supabase = createServerSupabaseClient();
    return await supabase.rpc("get_trending_posts", {
      limit_count: limitCount,
      offset_count: offsetCount,
    });
  }
);

/**
 * Search posts with automatic caching
 * @param searchTerm - The search term to filter posts
 * @param limitCount - Maximum number of posts to return (default: 10)
 * @param offsetCount - Number of posts to skip (default: 0)
 */
const searchPosts = cached(
  async ({
    searchTerm,
    limitCount = 10,
    offsetCount = 0,
  }: {
    searchTerm: string;
    limitCount?: number;
    offsetCount?: number;
  }): Promise<PostgrestSingleResponse<any>> => {
    const supabase = createServerSupabaseClient();
    return await supabase.rpc("search_posts", {
      search_term: searchTerm,
      limit_count: limitCount,
      offset_count: offsetCount,
    });
  }
);

/**
 * Create a new post (no caching for mutations)
 * @param data - Post data to insert
 */
async function createPost(
  data: Pick<Tables<"posts">, "content" | "user_id"> &
    Partial<Pick<Tables<"posts">, "parent_post_id" | "repost_post_id">>
): Promise<PostgrestSingleResponse<Tables<"posts">>> {
  const supabase = createServerSupabaseClient();
  return await supabase.from("posts").insert(data).select().single();
}

/**
 * Delete a post (no caching for mutations)
 * @param postId - ID of the post to delete
 */
async function deletePost(postId: string): Promise<PostgrestSingleResponse<null>> {
  const supabase = createServerSupabaseClient();
  return await supabase.from("posts").delete().eq("id", postId);
}

/**
 * Get a single post by ID with automatic caching
 * @param postId - ID of the post to retrieve
 */
const getPostById = cached(
  async (postId: string): Promise<PostgrestSingleResponse<NestedPost>> => {
    const supabase = createServerSupabaseClient();
    return await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single()
      .overrideTypes<NestedPost>();
  }
);

/**
 * Post service for all post-related database operations
 * Queries are automatically cached, mutations are not
 * 
 * @example
 * ```typescript
 * import { postService } from "@/lib/db/services/post.service";
 * 
 * const { data, error } = await postService.getUserFeed();
 * await postService.createPost({ content, user_id });
 * ```
 */
export const postService = {
  getUserFeed,
  getUserPosts,
  getTrendingPosts,
  searchPosts,
  createPost,
  deletePost,
  getPostById,
};

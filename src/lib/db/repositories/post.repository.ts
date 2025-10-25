import type { NestedPost } from "@/types/nested-posts";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Tables } from "database.types";
import { BaseRepository } from "./base.repository";

/**
 * Repository for post-related database operations
 * Queries are automatically cached, mutations are not
 */
class PostRepository extends BaseRepository {
  /**
   * Get user feed with automatic caching
   * @param cursor - Optional timestamp to fetch posts before this point
   */
  getUserFeed = this.cached(
    async (cursor?: string): Promise<PostgrestSingleResponse<NestedPost[]>> => {
      let query = this.supabase
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
  getUserPosts = this.cached(
    async ({
      username,
      cursor,
    }: {
      username: string;
      cursor?: string;
    }): Promise<PostgrestSingleResponse<NestedPost[]>> => {
      let query = this.supabase
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
  getTrendingPosts = this.cached(
    async ({
      limitCount = 10,
      offsetCount = 0,
    }: {
      limitCount?: number;
      offsetCount?: number;
    } = {}): Promise<PostgrestSingleResponse<any>> => {
      return await this.supabase.rpc("get_trending_posts", {
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
  searchPosts = this.cached(
    async ({
      searchTerm,
      limitCount = 10,
      offsetCount = 0,
    }: {
      searchTerm: string;
      limitCount?: number;
      offsetCount?: number;
    }): Promise<PostgrestSingleResponse<any>> => {
      return await this.supabase.rpc("search_posts", {
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
  async createPost(
    data: Pick<Tables<"posts">, "content" | "user_id"> &
      Partial<Pick<Tables<"posts">, "parent_post_id" | "repost_post_id">>
  ): Promise<PostgrestSingleResponse<Tables<"posts">>> {
    return await this.supabase.from("posts").insert(data).select().single();
  }

  /**
   * Delete a post (no caching for mutations)
   * @param postId - ID of the post to delete
   */
  async deletePost(postId: string): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.from("posts").delete().eq("id", postId);
  }

  /**
   * Get a single post by ID with automatic caching
   * @param postId - ID of the post to retrieve
   */
  getPostById = this.cached(
    async (postId: string): Promise<PostgrestSingleResponse<NestedPost>> => {
      return await this.supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single()
        .overrideTypes<NestedPost>();
    }
  );
}

/**
 * Singleton instance of PostRepository
 * Import this to access all post-related database operations
 * 
 * @example
 * ```typescript
 * import { postRepository } from "@/lib/db/repositories/post.repository";
 * 
 * const { data, error } = await postRepository.getUserFeed();
 * ```
 */
export const postRepository = new PostRepository();

import { postRepository } from "@/lib/db/repositories";
import type { NestedPost } from "@/types/nested-posts";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Retrieves a user's feed posts with optional pagination cursor.
 *
 * @param {string} [cursor] - Optional cursor (timestamp) to fetch posts before this point.
 * @returns {Promise<{ data: NestedPost[] | null; error: PostgrestError | null }>} Promise with user feed posts data and error if any.
 */
async function getUserFeed(
  cursor?: string,
): Promise<{ data: NestedPost[] | null; error: PostgrestError | null }> {
  return await postRepository.getUserFeed(cursor);
}

/**
 * Retrieves posts by a specific username with optional pagination cursor.
 *
 * @param {object} params - Parameters object.
 * @param {string} params.username - The username to fetch posts for.
 * @param {string} [params.cursor] - Optional cursor (timestamp) to fetch posts before this point.
 * @returns {Promise<{ data: NestedPost[] | null; error: PostgrestError | null }>} Promise with user posts data and error if any.
 */
async function getUserPosts({
  username,
  cursor,
}: {
  username: string;
  cursor?: string;
}): Promise<{ data: NestedPost[] | null; error: PostgrestError | null }> {
  return await postRepository.getUserPosts({ username, cursor });
}

/**
 * Real implementation of the feed service
 */
export const feedService = {
  getUserFeed,
  getUserPosts,
};

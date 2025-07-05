import { createServerSupabaseClient } from "@/db/supabase";
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
  const supabaseClient = createServerSupabaseClient();

  let query = supabaseClient
    .rpc("get_user_feed")
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  // If cursor is provided, filter posts created before this timestamp
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const result = await query;
  return result;
}

/**
 * Real implementation of the feed service
 */
export const feedService = {
  getUserFeed,
};

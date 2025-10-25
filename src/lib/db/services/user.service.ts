import { createAdminSupabaseClient, createServerSupabaseClient } from "@/db/supabase";
import type { Tables } from "database.types";

/**
 * Get user profile by username
 * @param username - Username to look up
 */
async function getUserByUsername(username: string) {
  const supabase = createServerSupabaseClient();
  return await supabase.from("users").select("*").eq("username", username).single();
}

/**
 * Get user profile by ID
 * @param userId - User ID to look up
 */
async function getUserById(userId: string) {
  const supabase = createServerSupabaseClient();
  return await supabase.from("users").select("*").eq("id", userId).single();
}

/**
 * Update user profile (no caching for mutations)
 * @param username - Username of the user to update
 * @param data - Profile data to update
 */
async function updateProfile(username: string, data: Partial<Tables<"users">>) {
  const supabase = createServerSupabaseClient();
  return await supabase.from("users").update(data).eq("username", username).select().single();
}

/**
 * Upsert user profile (used for webhook sync)
 * @param data - User data to upsert
 */
async function upsertUser(data: Partial<Tables<"users">>) {
  const supabase = createAdminSupabaseClient();
  return await supabase
    .from("users")
    .upsert(data as Tables<"users">)
    .select()
    .single();
}

/**
 * Delete user (no caching for mutations)
 * @param userId - ID of the user to delete
 */
async function deleteUser(userId: string) {
  const supabase = createAdminSupabaseClient();
  return await supabase.from("users").delete().eq("id", userId);
}

/**
 * Toggle follow status for a user
 * @param targetUserId - ID of the user to follow/unfollow
 */
async function toggleFollow(targetUserId: string) {
  const supabase = createServerSupabaseClient();
  return await supabase.rpc("toggle_follow", { target_user_id: targetUserId }).select().single();
}

/**
 * Get follow status between current user and target user
 * @param currentUserId - ID of the current user
 * @param targetUserId - ID of the target user
 */
async function getFollowStatus(currentUserId: string, targetUserId: string) {
  const supabase = createServerSupabaseClient();
  return await supabase
    .from("user_followers")
    .select("*")
    .eq("follower_id", currentUserId)
    .eq("followed_id", targetUserId)
    .single();
}

/**
 * Search users
 * @param searchTerm - The search term to filter users
 * @param limitCount - Maximum number of users to return (default: 10)
 * @param offsetCount - Number of users to skip (default: 0)
 */
async function searchUsers({
  searchTerm,
  limitCount = 10,
  offsetCount = 0,
}: {
  searchTerm: string;
  limitCount?: number;
  offsetCount?: number;
}) {
  const supabase = createServerSupabaseClient();
  return await supabase.rpc("search_users", {
    search_term: searchTerm,
    limit_count: limitCount,
    offset_count: offsetCount,
  });
}

/**
 * Get trending users
 * @param limitCount - Maximum number of users to return (default: 10)
 * @param offsetCount - Number of users to skip (default: 0)
 */
async function getTrendingUsers({
  limitCount = 10,
  offsetCount = 0,
}: {
  limitCount?: number;
  offsetCount?: number;
} = {}) {
  const supabase = createServerSupabaseClient();
  return await supabase.rpc("get_trending_users", {
    limit_count: limitCount,
    offset_count: offsetCount,
  });
}

/**
 * Get random unfollowed users
 * @param count - Number of users to return
 */
async function getRandomUnfollowedUsers(count: number = 3) {
  const supabase = createServerSupabaseClient();
  return await supabase.rpc("get_random_unfollowed_users", {
    count,
  });
}

/**
 * User service for all user-related database operations
 *
 * @example
 * ```typescript
 * import { userService } from "@/lib/db/services/user.service";
 *
 * const { data, error } = await userService.getUserByUsername("john");
 * await userService.updateProfile(username, { bio: "New bio" });
 * ```
 */
export const userService = {
  getUserByUsername,
  getUserById,
  updateProfile,
  upsertUser,
  deleteUser,
  toggleFollow,
  getFollowStatus,
  searchUsers,
  getTrendingUsers,
  getRandomUnfollowedUsers,
};

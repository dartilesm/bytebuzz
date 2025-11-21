import { createServerSupabaseClient } from "@/db/supabase";
import { createServiceWithContext } from "@/lib/create-service-with-context";
import type { ServiceContext } from "@/types/services";
import type { Tables } from "database.types";

/**
 * Get user profile by username
 * @param username - Username to look up
 */
async function getUserByUsername(this: ServiceContext, username: string) {
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  return await supabase.from("users").select("*").eq("username", username).single();
}

/**
 * Get user profile by ID
 * @param userId - User ID to look up
 */
async function getUserById(this: ServiceContext, userId: string) {
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  return await supabase.from("users").select("*").eq("id", userId).single();
}

/**
 * Update user profile
 * @param username - Username of the user to update
 * @param data - Profile data to update
 */
async function updateProfile(
  this: ServiceContext,
  data: Partial<Tables<"users">> & { id: string }
) {
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  return await supabase.from("users").update(data).eq("id", data.id).select();
}

/**
 * Toggle follow status for a user
 * @param targetUserId - ID of the user to follow/unfollow
 */
async function toggleFollow(this: ServiceContext, targetUserId: string) {
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  return await supabase.rpc("toggle_follow", { target_user_id: targetUserId }).select().single();
}

/**
 * Get follow status between current user and target user
 * @param currentUserId - ID of the current user
 * @param targetUserId - ID of the target user
 */
async function getFollowStatus(this: ServiceContext, currentUserId: string, targetUserId: string) {
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  return await supabase
    .from("user_followers")
    .select("*")
    .eq("follower_id", currentUserId)
    .eq("user_id", targetUserId)
    .single();
}

/**
 * Search users
 * @param searchTerm - The search term to filter users
 * @param limitCount - Maximum number of users to return (default: 10)
 * @param offsetCount - Number of users to skip (default: 0)
 */
async function searchUsers(
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
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
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
async function getTrendingUsers(
  this: ServiceContext,
  {
    limitCount = 10,
    offsetCount = 0,
  }: {
    limitCount?: number;
    offsetCount?: number;
  } = {}
) {
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  return await supabase.rpc("get_trending_users", {
    limit_count: limitCount,
    offset_count: offsetCount,
  });
}

/**
 * Get random unfollowed users
 * @param count - Number of users to return
 */
async function getRandomUnfollowedUsers(this: ServiceContext, count: number = 3) {
  const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  return await supabase.rpc("get_random_unfollowed_users", {
    count,
  });
}

/**
 * User service for all user-related database operations
 * For admin operations (upsert/delete), use adminService instead
 *
 * @example
 * ```typescript
 * import { userService } from "@/lib/db/services/user.service";
 *
 * const { data, error } = await userService.getUserByUsername("john");
 * await userService.updateProfile(username, { bio: "New bio" });
 * ```
 */
export const userService = createServiceWithContext({
  getUserByUsername,
  getUserById,
  updateProfile,
  toggleFollow,
  getFollowStatus,
  searchUsers,
  getTrendingUsers,
  getRandomUnfollowedUsers,
});

export type UserService = typeof userService;

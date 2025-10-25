import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getSupabaseClient, cached } from "./base.service";
import type { Tables } from "database.types";

/**
 * Get user profile by username with automatic caching
 * @param username - Username to look up
 */
const getUserByUsername = cached(
  async (username: string): Promise<PostgrestSingleResponse<Tables<"users">>> => {
    const supabase = getSupabaseClient();
    return await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();
  }
);

/**
 * Get user profile by ID with automatic caching
 * @param userId - User ID to look up
 */
const getUserById = cached(
  async (userId: string): Promise<PostgrestSingleResponse<Tables<"users">>> => {
    const supabase = getSupabaseClient();
    return await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
  }
);

/**
 * Update user profile (no caching for mutations)
 * @param username - Username of the user to update
 * @param data - Profile data to update
 */
async function updateProfile(
  username: string,
  data: Partial<Tables<"users">>
): Promise<PostgrestSingleResponse<Tables<"users">>> {
  const supabase = getSupabaseClient();
  return await supabase
    .from("users")
    .update(data)
    .eq("username", username)
    .select()
    .single();
}

/**
 * Upsert user profile (used for webhook sync)
 * @param data - User data to upsert
 */
async function upsertUser(data: any): Promise<PostgrestSingleResponse<Tables<"users">>> {
  const supabase = getSupabaseClient();
  return await supabase
    .from("users")
    .upsert(data)
    .select()
    .single();
}

/**
 * Delete user (no caching for mutations)
 * @param userId - ID of the user to delete
 */
async function deleteUser(userId: string): Promise<PostgrestSingleResponse<null>> {
  const supabase = getSupabaseClient();
  return await supabase.from("users").delete().eq("id", userId);
}

/**
 * Toggle follow status for a user
 * @param targetUserId - ID of the user to follow/unfollow
 */
async function toggleFollow(
  targetUserId: string
): Promise<PostgrestSingleResponse<Tables<"user_followers">>> {
  const supabase = getSupabaseClient();
  return await supabase
    .rpc("toggle_follow", { target_user_id: targetUserId })
    .select()
    .single();
}

/**
 * Get follow status between current user and target user with caching
 * @param currentUserId - ID of the current user
 * @param targetUserId - ID of the target user
 */
const getFollowStatus = cached(
  async (
    currentUserId: string,
    targetUserId: string
  ): Promise<PostgrestSingleResponse<Tables<"user_followers">>> => {
    const supabase = getSupabaseClient();
    return await supabase
      .from("user_followers")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("followed_id", targetUserId)
      .single();
  }
);

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
};

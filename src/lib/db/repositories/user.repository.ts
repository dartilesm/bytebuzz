import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import type { Tables } from "database.types";

/**
 * Repository for user-related database operations
 */
class UserRepository extends BaseRepository {
  /**
   * Get user profile by username with automatic caching
   * @param username - Username to look up
   */
  getUserByUsername = this.cached(
    async (username: string): Promise<PostgrestSingleResponse<Tables<"users">>> => {
      return await this.supabase
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
  getUserById = this.cached(
    async (userId: string): Promise<PostgrestSingleResponse<Tables<"users">>> => {
      return await this.supabase
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
  async updateProfile(
    username: string,
    data: Partial<Tables<"users">>
  ): Promise<PostgrestSingleResponse<Tables<"users">>> {
    return await this.supabase
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
  async upsertUser(data: any): Promise<PostgrestSingleResponse<Tables<"users">>> {
    return await this.supabase
      .from("users")
      .upsert(data)
      .select()
      .single();
  }

  /**
   * Delete user (no caching for mutations)
   * @param userId - ID of the user to delete
   */
  async deleteUser(userId: string): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.from("users").delete().eq("id", userId);
  }

  /**
   * Toggle follow status for a user
   * @param targetUserId - ID of the user to follow/unfollow
   */
  async toggleFollow(
    targetUserId: string
  ): Promise<PostgrestSingleResponse<Tables<"user_followers">>> {
    return await this.supabase
      .rpc("toggle_follow", { target_user_id: targetUserId })
      .select()
      .single();
  }

  /**
   * Get follow status between current user and target user with caching
   * @param currentUserId - ID of the current user
   * @param targetUserId - ID of the target user
   */
  getFollowStatus = this.cached(
    async (
      currentUserId: string,
      targetUserId: string
    ): Promise<PostgrestSingleResponse<Tables<"user_followers">>> => {
      return await this.supabase
        .from("user_followers")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("followed_id", targetUserId)
        .single();
    }
  );
}

/**
 * Singleton instance of UserRepository
 * Import this to access all user-related database operations
 * 
 * @example
 * ```typescript
 * import { userRepository } from "@/lib/db/repositories";
 * 
 * const { data, error } = await userRepository.getUserByUsername("john");
 * ```
 */
export const userRepository = new UserRepository();

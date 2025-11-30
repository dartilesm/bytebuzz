import type { Tables } from "database.types";
import { createAdminSupabaseClient } from "@/db/supabase";

/**
 * Upsert user profile with admin permissions
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
 * Delete user with admin permissions
 * @param userId - ID of the user to delete
 */
async function deleteUser(userId: string) {
  const supabase = createAdminSupabaseClient();
  return await supabase.from("users").delete().eq("id", userId);
}

/**
 * Admin service for operations requiring elevated permissions
 * Used for webhook handlers and system-level operations
 *
 * @example
 * ```typescript
 * import { adminService } from "@/lib/db/services/admin.service";
 *
 * // In webhook handler
 * await adminService.user.upsert({ id, username, display_name });
 * await adminService.user.delete(userId);
 * ```
 */
export const adminService = {
  user: {
    upsert: upsertUser,
    delete: deleteUser,
  },
};

export type AdminService = typeof adminService;

"use server";

import { userService } from "@/lib/db/services/user.service";

export interface ToggleFollowData {
  target_user_id: string;
}

export async function toggleFollow({
  target_user_id,
}: ToggleFollowData) {
  return await userService.toggleFollow(target_user_id);
}

"use server";

import { userRepository } from "@/lib/db/repositories/user.repository";

export interface ToggleFollowData {
  target_user_id: string;
}

export async function toggleFollow({
  target_user_id,
}: ToggleFollowData) {
  return await userRepository.toggleFollow(target_user_id);
}

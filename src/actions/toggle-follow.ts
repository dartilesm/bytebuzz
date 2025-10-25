"use server";

import { userRepository } from "@/lib/db/repositories";
import type { Tables } from "database.types";
import type { DbResult } from "@/lib/db/repositories";

export interface ToggleFollowData {
  target_user_id: string;
}

export async function toggleFollow({
  target_user_id,
}: ToggleFollowData): Promise<DbResult<Tables<"user_followers">>> {
  return await userRepository.toggleFollow(target_user_id);
}

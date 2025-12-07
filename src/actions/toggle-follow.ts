"use server";

import { revalidateTag } from "next/cache";
import { userService } from "@/lib/db/services/user.service";

export interface ToggleFollowData {
  target_user_id: string;
}

export async function toggleFollow({ target_user_id }: ToggleFollowData) {
  const toggleFollowResult = await userService.toggleFollow(target_user_id);

  // Clear the cache for the /api/users/follow-status route
  if (!toggleFollowResult.error) revalidateTag("is-following", { expire: 0 });

  return toggleFollowResult;
}

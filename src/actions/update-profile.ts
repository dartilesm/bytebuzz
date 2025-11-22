"use server";

import { userService } from "@/lib/db/services/user.service";
import type { Tables } from "database.types";
import { revalidatePath } from "next/cache";

export type UpdateProfileData = Partial<Tables<"users">>;

export async function updateProfile(data: UpdateProfileData) {
  if (!data.id) {
    throw new Error("User ID is required");
  }

  // Exclude username from profile data
  const { id, username, ...profileData } = data;

  const result = await userService.updateProfile({ id, ...profileData });

  if (!result.error) revalidatePath(`/@${data.username}`);

  return result;
}

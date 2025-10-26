"use server";

import { userService } from "@/lib/db/services/user.service";
import type { Tables } from "database.types";
import { revalidatePath } from "next/cache";

export type UpdateProfileData = Partial<Tables<"users">>;

export async function updateProfile(data: UpdateProfileData) {
  if (!data.username) {
    throw new Error("Username is required");
  }

  const result = await userService.updateProfile(data.username, data);

  if (!result.error) revalidatePath(`/@${data.username}`);

  return result;
}

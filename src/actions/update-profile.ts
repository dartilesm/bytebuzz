"use server";

import { userService } from "@/lib/db/services/user.service";
import { auth } from "@clerk/nextjs/server";
import type { Tables } from "database.types";
import { revalidatePath } from "next/cache";

export type UpdateProfileData = Partial<Tables<"users">>;

export async function updateProfile(data: UpdateProfileData) {
  const session = await auth();
  if (!session || !session.userId) {
    throw new Error("User not authenticated");
  }

  // Exclude username from profile data
  const { id, username, ...profileData } = data;

  const result = await userService.updateProfile({ id: session.userId, ...profileData });

  if (!result.error) revalidatePath(`/@${data.username}`);

  return result;
}

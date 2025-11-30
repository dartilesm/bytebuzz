"use server";

import { auth } from "@clerk/nextjs/server";
import type { Tables } from "database.types";
import { revalidatePath } from "next/cache";
import { userService } from "@/lib/db/services/user.service";

export type UpdateProfileData = Partial<Tables<"users">>;

export async function updateProfile(data: UpdateProfileData) {
  const session = await auth();
  if (!session || !session.userId) {
    throw new Error("User not authenticated");
  }

  // Exclude username from profile data
  const { id: _id, username: _username, ...profileData } = data;

  const result = await userService.updateProfile({ id: session.userId, ...profileData });

  if (!result.error) revalidatePath(`/@${data.username}`);

  return result;
}

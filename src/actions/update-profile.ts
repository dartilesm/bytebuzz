"use server";

import { userRepository } from "@/lib/db/repositories";
import type { Tables } from "database.types";
import type { DbResult } from "@/lib/db/repositories";
import { revalidatePath } from "next/cache";

export type UpdateProfileData = Partial<Tables<"users">>;

export async function updateProfile(
  data: UpdateProfileData,
): Promise<DbResult<Tables<"users">>> {
  if (!data.username) {
    throw new Error("Username is required");
  }

  const result = await userRepository.updateProfile(data.username, data);

  if (!result.error) revalidatePath(`/@${data.username}`);

  return result;
}

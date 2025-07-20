"use server";

import { createServerSupabaseClient } from "@/db/supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Tables } from "database.types";
import { revalidatePath } from "next/cache";

export type UpdateProfileData = Partial<Tables<"users">>;

export async function updateProfile(
  data: UpdateProfileData,
): Promise<PostgrestSingleResponse<Tables<"users">>> {
  if (!data.username) {
    throw new Error("Username is required");
  }

  const supabaseClient = createServerSupabaseClient();

  const result = await supabaseClient
    .from("users")
    .update(data)
    .eq("username", data.username)
    .select()
    .single();

  if (!result.error) revalidatePath(`/@${data.username}`);

  return result;
}

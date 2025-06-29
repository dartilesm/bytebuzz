"use server";

import { createServerSupabaseClient } from "@/db/supabase";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Uploads a media file to Supabase storage in a temporary location
 * @param file - The file to upload
 * @returns Promise with the proxied URL of the uploaded file
 */
export async function uploadPostMediaAction(
  file: File,
): Promise<{ publicUrl: string; proxyUrl: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const user = await currentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const userId = user.id;
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "";
    const mediaType = file.type.startsWith("image/") ? "image" : "video";

    // Generate a temporary path for the file
    const fileNameWithoutExtension = `${timestamp}_${mediaType}`;
    const filePath = `${userId}/temp/${fileNameWithoutExtension}.${extension}`;

    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(filePath);

    // Instead of getting the Supabase URL, return our proxied URL
    const proxyUrl = `/api/media/${userId}/${fileNameWithoutExtension}`;

    return {
      publicUrl,
      proxyUrl,
    };
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
}

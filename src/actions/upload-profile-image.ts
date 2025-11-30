"use server";

import { auth } from "@clerk/nextjs/server";
import { mediaService } from "@/lib/db/services/media.service";
import { log } from "@/lib/logger/logger";

export type ProfileImageType = "avatar" | "cover";

/**
 * Uploads a profile image to Supabase storage
 * @param file - The image file to upload
 * @param type - The type of profile image (avatar or cover)
 * @returns The public URL of the uploaded image
 */
export async function uploadProfileImage(file: File, type: ProfileImageType): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  // Get file extension
  const fileExtension = file.name.split(".").pop() || "jpg";

  // Create filename with timestamp
  const timestamp = Date.now();
  const fileName = `${timestamp}_${type}.${fileExtension}`;

  log.info("Uploading profile image", { userId });

  // Create file path following the structure: post-images/{user_id}/profile/{filename}
  const filePath = `${userId}/profile/${fileName}`;

  try {
    // Upload file to Supabase storage
    const { error } = await mediaService.uploadFile("post-images", filePath, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite existing file with same name
    });

    if (error) {
      log.error("Upload error", { error });
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const publicUrl = mediaService.getPublicUrl("post-images", filePath);

    if (!publicUrl) {
      throw new Error("Failed to get public URL for uploaded image");
    }

    return publicUrl;
  } catch (error) {
    log.error("Profile image upload failed", { error });
    throw new Error(error instanceof Error ? error.message : "Failed to upload profile image");
  }
}

/**
 * Deletes a profile image from Supabase storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/post-images\/(.+)/);

    if (!pathMatch) {
      throw new Error("Invalid image URL format");
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    // Delete file from storage
    const { error } = await mediaService.removeFiles("post-images", [filePath]);

    if (error) {
      log.error("Delete error", { error });
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    log.error("Profile image deletion failed", { error });
    throw new Error(error instanceof Error ? error.message : "Failed to delete profile image");
  }
}

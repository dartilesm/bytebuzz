import { type UseMutationOptions } from "@tanstack/react-query";
import { createPostAction } from "@/actions/create-post";
import { type ToggleFollowData, toggleFollow } from "@/actions/toggle-follow";
import { type ToggleReactionData, toggleReaction } from "@/actions/toggle-reaction";
import { type UpdateProfileData, updateProfile } from "@/actions/update-profile";
import { deleteProfileImage, uploadProfileImage } from "@/actions/upload-profile-image";
import { uploadPostMediaAction } from "@/actions/upload-post-media";
import { log } from "@/lib/logger/logger";

export type UpdateProfileWithFilesData = UpdateProfileData & {
  imageFile?: File;
  coverImageFile?: File;
  currentImageUrl?: string;
  currentCoverImageUrl?: string;
};

/**
 * Handles image upload with existing image cleanup
 */
async function handleImageUpload(
  file: File | undefined,
  type: "avatar" | "cover",
  currentUrl?: string,
): Promise<string | undefined> {
  if (!file) return undefined;

  try {
    // Delete existing image if it's a Supabase URL
    if (currentUrl?.includes("supabase")) {
      try {
        await deleteProfileImage(currentUrl);
      } catch (deleteError) {
        log.warn(`Failed to delete existing ${type}`, { deleteError });
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image
    const newUrl = await uploadProfileImage(file, type);
    return newUrl;
  } catch (error) {
    log.error(`Failed to upload ${type}`, { error });
    throw new Error(`Failed to upload ${type === "avatar" ? "profile picture" : "cover image"}`);
  }
}

export const mutationOptions = {
  createPost: {
    mutationFn: createPostAction,
  },
  
  toggleFollow: {
    mutationFn: async (data: ToggleFollowData) => {
      const response = await toggleFollow(data);
      if (response.error) {
        throw response.error;
      }
      return response;
    },
  },

  toggleReaction: {
    mutationFn: async (data: ToggleReactionData) => {
      const response = await toggleReaction(data);
      if (response.error) {
        throw response.error;
      }
      return response;
    },
  },

  updateProfile: {
    mutationFn: async (data: UpdateProfileWithFilesData) => {
      const {
        currentImageUrl,
        currentCoverImageUrl,
        coverImageFile,
        imageFile,
        fts: _fts, // Exclude from update as it can only be updated to DEFAULT
        ...profileDataToUpdate
      } = data;

      // Handle image uploads with cleanup
      const [imageUrl, coverImageUrl] = await Promise.all([
        handleImageUpload(imageFile, "avatar", currentImageUrl),
        handleImageUpload(coverImageFile, "cover", currentCoverImageUrl),
      ]);

      // Prepare profile data for update
      const profileData: UpdateProfileData = {
        ...profileDataToUpdate,
        image_url: imageUrl || currentImageUrl,
        cover_image_url: coverImageUrl || currentCoverImageUrl,
        top_technologies: profileDataToUpdate.top_technologies,
      };

      log.info("Profile data prepared", { profileData });

      const response = await updateProfile(profileData);

      if (response.error) {
        throw response.error;
      }

      return response;
    },
  },

  uploadPostMedia: {
    mutationFn: uploadPostMediaAction,
  },
};


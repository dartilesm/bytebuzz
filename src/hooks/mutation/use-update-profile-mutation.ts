import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type UpdateProfileData, updateProfile } from "@/actions/update-profile";
import { deleteProfileImage, uploadProfileImage } from "@/actions/upload-profile-image";
import { log } from "@/lib/logger/logger";

export type UpdateProfileWithFilesData = UpdateProfileData & {
  imageFile?: File;
  coverImageFile?: File;
  currentImageUrl?: string;
  currentCoverImageUrl?: string;
};

export function useUpdateProfileMutation(
  useMutationProps: UseMutationOptions<
    Awaited<ReturnType<typeof updateProfile>>,
    Error,
    UpdateProfileWithFilesData
  >,
) {
  const mutation = useMutation({
    ...useMutationProps,
    mutationFn: async (data: UpdateProfileWithFilesData) => {
      const {
        currentImageUrl,
        currentCoverImageUrl,
        coverImageFile,
        imageFile,
        fts, // Exclude from update as it can only be updated to DEFAULT
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
  });

  return mutation;
}

/**
 * Handles image upload with existing image cleanup
 * @param file - The new image file to upload
 * @param type - The type of profile image (avatar or cover)
 * @param currentUrl - The current image URL to delete (if exists)
 * @returns The new image URL
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

import { type UpdateProfileData, updateProfile } from "@/actions/update-profile";
import { uploadProfileImage, deleteProfileImage } from "@/actions/upload-profile-image";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";

export type UpdateProfileWithFilesData = Omit<
  UpdateProfileData,
  "image_url" | "cover_image_url"
> & {
  imageFile?: File;
  coverImageFile?: File;
  image_url?: string;
  cover_image_url?: string;
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
      // Handle image uploads with cleanup
      const [imageUrl, coverImageUrl] = await Promise.all([
        handleImageUpload(data.imageFile, "avatar", data.currentImageUrl),
        handleImageUpload(data.coverImageFile, "cover", data.currentCoverImageUrl),
      ]);

      // Prepare profile data for update
      const profileData: UpdateProfileData = {
        username: data.username,
        display_name: data.display_name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        image_url: imageUrl || data.image_url,
        cover_image_url: coverImageUrl || data.cover_image_url,
        top_technologies: data.top_technologies,
      };

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
        console.warn(`Failed to delete existing ${type}:`, deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image
    const newUrl = await uploadProfileImage(file, type);
    return newUrl;
  } catch (error) {
    console.error(`Failed to upload ${type}:`, error);
    throw new Error(`Failed to upload ${type === "avatar" ? "profile picture" : "cover image"}`);
  }
}

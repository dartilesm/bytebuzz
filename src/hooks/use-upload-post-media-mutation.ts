import { useMutation } from "@tanstack/react-query";
import { uploadPostMediaAction } from "@/actions/upload-post-media";

/**
 * Hook for uploading images with React Query mutation
 * Uses the mocked upload action to simulate async image upload
 */
export function useUploadPostMediaMutation() {
  return useMutation({
    mutationFn: uploadPostMediaAction,
    onSuccess: (url) => {
      console.log("Image uploaded successfully:", url);
    },
    onError: (error) => {
      console.error("Failed to upload image:", error);
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { uploadImageAction } from "@/actions/upload-image";

/**
 * Hook for uploading images with React Query mutation
 * Uses the mocked upload action to simulate async image upload
 */
export function useUploadImageMutation() {
  return useMutation({
    mutationFn: uploadImageAction,
    onSuccess: (url) => {
      console.log("Image uploaded successfully:", url);
    },
    onError: (error) => {
      console.error("Failed to upload image:", error);
    },
  });
}

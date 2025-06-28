import { useMutation } from "@tanstack/react-query";
import { uploadPostMediaAction } from "@/actions/upload-post-media";
import { addToast } from "@heroui/react";

/**
 * Hook for uploading media files to Supabase storage
 * Handles the upload process with proper error handling and success notifications
 */
export function useUploadPostMediaMutation() {
  return useMutation({
    mutationFn: uploadPostMediaAction,
    onSuccess: (url) => {
      addToast({
        title: "Media uploaded successfully",
        description: "Your media file has been uploaded and is ready to use.",
        variant: "flat",
        color: "success",
      });
      return url;
    },
    onError: (error: Error) => {
      addToast({
        title: "Upload failed",
        description: error.message || "Failed to upload media. Please try again.",
        variant: "flat",
        color: "danger",
      });
      throw error;
    },
  });
}

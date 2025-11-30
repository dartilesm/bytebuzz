import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadPostMediaAction } from "@/actions/upload-post-media";

/**
 * Hook for uploading media files to Supabase storage
 * Handles the upload process with proper error handling and success notifications
 */
export function useUploadPostMediaMutation() {
  return useMutation({
    mutationFn: uploadPostMediaAction,
    onSuccess: (url) => {
      toast.success("Media uploaded successfully", {
        description: "Your media file has been uploaded and is ready to use.",
      });
      return url;
    },
    onError: (error: Error) => {
      toast.error("Upload failed", {
        description: error.message || "Failed to upload media. Please try again.",
      });
      throw error;
    },
  });
}

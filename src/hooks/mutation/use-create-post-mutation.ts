import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mutationOptions } from "@/hooks/mutation/options/mutation-options";

/**
 * Hook for creating a post with optional media attachments
 * Handles optimistic updates and error handling
 * Supports multiple media files per post
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationOptions.createPost,
    onSuccess: () => {
      // Invalidate the posts query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast.success("Post created", {
        description: "Your post has been published successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create post", {
        description: error.message || "Something went wrong. Please try again.",
      });
    },
  });
}

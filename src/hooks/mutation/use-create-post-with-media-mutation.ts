import { createPostWithMediaAction } from "@/actions/create-post-with-media";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook for creating a post with optional media attachment
 * Handles optimistic updates and error handling
 */
export function useCreatePostWithMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPostWithMediaAction,
    onSuccess: () => {
      // Invalidate the posts query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      addToast({
        title: "Post created",
        description: "Your post has been published successfully",
        variant: "flat",
        color: "success",
      });
    },
    onError: (error: Error) => {
      addToast({
        title: "Failed to create post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "flat",
        color: "danger",
      });
    },
  });
}

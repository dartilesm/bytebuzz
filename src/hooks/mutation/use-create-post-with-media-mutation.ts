import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPostWithMediaAction } from "@/actions/create-post-with-media";
import { addToast } from "@heroui/react";
import type { NestedPost } from "@/types/nested-posts";
import { PostsContext } from "@/context/posts-context";
import { useContext } from "react";

/**
 * Hook for creating a post with optional media attachment
 * Handles optimistic updates and error handling
 */
export function useCreatePostWithMediaMutation() {
  const queryClient = useQueryClient();
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error("useCreatePostWithMediaMutation must be used within a PostsProvider");
  }

  const { addPost } = context;

  return useMutation({
    mutationFn: createPostWithMediaAction,
    onSuccess: (newPost: NestedPost) => {
      // Add the new post to the context for immediate UI update
      addPost(newPost);

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

"use client";

import { useContext } from "react";
import { PostsContext } from "@/context/posts-context";
/**
 * Hook to access the posts context
 */
export function usePostsContext() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePostsContext must be used within a PostsProvider");
  }
  return context;
}

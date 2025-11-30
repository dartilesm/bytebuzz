"use client";

import { useQuery } from "@tanstack/react-query";
import type { NestedPost } from "@/types/nested-posts";

interface PostThreadData {
  postAncestry: NestedPost[];
  directReplies: NestedPost[];
}

interface ErrorResponse {
  error: string;
}

async function getPostThread(postId: string) {
  const fetchResponse = await fetch(`/api/posts/${postId}`);
  const data = (await fetchResponse.json()) as
    | { data: PostThreadData; success: boolean }
    | ErrorResponse;

  if ("error" in data && typeof data === "object" && data !== null) {
    throw new Error((data as ErrorResponse).error);
  }

  if ("success" in data && data.success && data.data) {
    return data.data;
  }

  throw new Error("Failed to fetch post thread");
}

/**
 * Hook to fetch post thread (ancestry and replies) for a given post ID
 */
export function usePostThreadQuery(postId: string | undefined) {
  return useQuery({
    queryKey: ["post-thread", postId],
    queryFn: () => getPostThread(postId!),
    enabled: !!postId,
  });
}

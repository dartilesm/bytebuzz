"use client";

import type { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { usePostsContext } from "@/hooks/use-posts-context";
import type { NestedPost } from "@/types/nested-posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef } from "react";

export function usePostsQuery(queryType?: POST_QUERY_TYPE) {
  const isFirstRenderRef = useRef(true);
  const { posts } = usePostsContext();

  const isEnabled = !!queryType && !isFirstRenderRef.current;

  const infiniteQuery = useInfiniteQuery({
    queryKey: ["posts", queryType],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => fetchMorePosts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { data: NestedPost[] | null; error: unknown }) => {
      // If we have posts in the last page, return the created_at of the last post as cursor
      if (lastPage.data && lastPage.data.length > 0) {
        const lastPost = lastPage.data[lastPage.data.length - 1];
        return lastPost.created_at || undefined;
      }
      // No more pages
      return undefined;
    },
    enabled: isEnabled,
    initialData: {
      pageParams: [undefined],
      pages: [
        {
          data: posts,
          error: null,
        },
      ],
    },
  });

  function fetchMorePosts(cursor?: string) {
    if (!isEnabled) return Promise.resolve({ data: [], error: null });

    const url = new URL(`/api/posts/${queryType}`, window.location.href);
    url.searchParams.set("cursor", cursor || "");
    return fetch(url.toString()).then((res) => res.json());
  }

  function fetchNextPage(...args: Parameters<typeof infiniteQuery.fetchNextPage>) {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
    }
    return infiniteQuery.fetchNextPage(...args);
  }

  const modifiedInfiniteQuery = {
    ...infiniteQuery,
    fetchNextPage,
  };

  return modifiedInfiniteQuery;
}

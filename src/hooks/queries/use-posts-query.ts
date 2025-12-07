"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef } from "react";
import type { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { usePostsContext } from "@/hooks/use-posts-context";
import { postQueries } from "@/hooks/queries/options/post-queries";
import type { NestedPost } from "@/types/nested-posts";

export function usePostsQuery(queryType?: POST_QUERY_TYPE) {
  const isFirstRenderRef = useRef(true);
  const { posts } = usePostsContext();

  const username = posts?.[0]?.user?.username;

  const isEnabled = !!queryType && !isFirstRenderRef.current;

  function fetchMorePosts(cursor?: string) {
    if (!isEnabled || !queryType) return Promise.resolve({ data: [], error: null });

    const url = new URL(`/api/posts/${queryType}`, window.location.href);
    url.searchParams.set("cursor", cursor || "");
    return fetch(url.toString()).then((res) => res.json());
  }

  const infiniteQuery = useInfiniteQuery({
    ...postQueries.list(queryType, username),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => fetchMorePosts(pageParam),
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

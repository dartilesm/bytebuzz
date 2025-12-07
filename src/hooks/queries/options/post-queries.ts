import { infiniteQueryOptions } from "@tanstack/react-query";
import type { POST_QUERY_TYPE } from "@/constants/post-query-type";
import type { NestedPost } from "@/types/nested-posts";

async function fetchPosts(queryType: POST_QUERY_TYPE, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) {
    params.set("cursor", cursor);
  }

  const res = await fetch(`/api/posts/${queryType}?${params.toString()}`);
  return res.json();
}

export const postQueries = {
  list: (queryType?: POST_QUERY_TYPE, username?: string) =>
    infiniteQueryOptions({
      queryKey: ["posts", queryType, username],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        queryType ? fetchPosts(queryType, pageParam) : Promise.resolve({ data: [], error: null }),
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
      enabled: !!queryType,
    }),
};


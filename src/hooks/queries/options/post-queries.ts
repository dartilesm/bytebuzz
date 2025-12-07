import { infiniteQueryOptions } from "@tanstack/react-query";
import { createSerializer, parseAsString } from "nuqs/server";
import type { POST_QUERY_TYPE } from "@/constants/post-query-type";
import type { NestedPost } from "@/types/nested-posts";

const postsQueryParams = {
  cursor: parseAsString,
  postId: parseAsString,
} as const;

const serializePostsQueryParams = createSerializer(postsQueryParams);
async function fetchPosts({
  queryType,
  postId,
  cursor,
}: {
  queryType: POST_QUERY_TYPE;
  postId?: string;
  cursor?: string;
}) {
  const url = new URL(`/api/posts/${queryType}`, window.location.href);
  const serializedQueryParams = serializePostsQueryParams({ cursor, postId });

  return fetch(url.toString() + serializedQueryParams).then((res) => res.json());
}

export const postQueries = {
  list: ({
    queryType,
    username,
    postId,
  }: {
    queryType: POST_QUERY_TYPE;
    username?: string;
    postId?: string;
  }) =>
    infiniteQueryOptions({
      queryKey: ["posts", queryType, username],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        queryType
          ? fetchPosts({ queryType, postId, cursor: pageParam })
          : Promise.resolve({ data: [], error: null }),
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

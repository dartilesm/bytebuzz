import { usePostsContext } from "@/hooks/use-posts-context";
import type { NestedPost } from "@/types/nested-posts";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useFetchPosts() {
  const { posts, fetchMorePosts } = usePostsContext();

  return useInfiniteQuery({
    queryKey: ["posts", "feed"],
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
}

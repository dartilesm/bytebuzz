"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { UserPostLoading } from "@/components/loading/user-post.loading";
import { CondensedUserPost } from "@/components/post/condensed-user-post";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import type { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { postQueries } from "@/hooks/queries/options/post-queries";
import { usePostsContext } from "@/hooks/use-posts-context";

interface PostListProps {
  postQueryType: POST_QUERY_TYPE;
  postId?: string;
}

export function PostList({ postQueryType, postId }: PostListProps) {
  const isFirstRenderRef = useRef(true);
  const { posts } = usePostsContext();
  const username = posts?.[0]?.user?.username;
  const isEnabled = !!postQueryType && !isFirstRenderRef.current;

  const infiniteQuery = useInfiniteQuery({
    ...postQueries.list({ queryType: postQueryType, username, postId }),
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

  const { data, hasNextPage, isFetchingNextPage } = infiniteQuery;

  // Set up intersection observer for the last post
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 1,
    root: null,
    rootMargin: "30%",
  });

  // Trigger loading more posts when last post becomes visible
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage({ cancelRefetch: false });
    }
  }, [isIntersecting]);

  return (
    <div className="flex flex-col gap-2">
      {data.pages.map((page) => {
        return page.data?.map((post) => (
          <PostWrapper key={post.id}>
            <UserPost post={post} minVisibleContentLength={800}>
              {post.repost && <CondensedUserPost post={post.repost} />}
            </UserPost>
          </PostWrapper>
        ));
      })}
      {/* Tracker ref for the last post */}
      <div ref={ref} />
      {data.pages.flatMap((page) => page.data).length === 0 && (
        <span className="text-center text-sm text-muted-foreground">No posts found</span>
      )}
      {isFetchingNextPage && <UserPostLoading />}
    </div>
  );
}

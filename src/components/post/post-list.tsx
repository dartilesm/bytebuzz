"use client";

import { CondensedUserPost } from "@/components/post/condensed-user-post";
import { PostWrapper } from "@/components/post/post-wrapper";
import { usePostsQuery } from "@/hooks/queries/use-posts-query";
import { useEffect } from "react";
import { UserPost } from "@/components/post/user-post";
import { UserPostLoading } from "@/components/loading/user-post.loading";
import type { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { useIntersectionObserver } from "usehooks-ts";

interface PostListProps {
  postQueryType?: POST_QUERY_TYPE;
}

export function PostList({ postQueryType }: PostListProps) {
  // Set up infinite query for posts
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostsQuery(postQueryType);

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

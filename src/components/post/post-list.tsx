"use client";

import { CondensedUserPost } from "@/components/post/condensed-user-post";
import { PostWrapper } from "@/components/post/post-wrapper";
import { useFetchUserPosts } from "@/hooks/fetch/use-fetch-user-posts";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useEffect } from "react";
import { UserPost } from "./user-post";
import { UserPostLoading } from "@/components/loading/user-post.loading";

export function PostList() {
  // Set up infinite query for posts
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchUserPosts();

  // Set up intersection observer for the last post
  const [ref, entry] = useIntersectionObserver({
    threshold: 1,
    root: null,
    rootMargin: "100px",
  });

  // Trigger loading more posts when last post becomes visible
  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      console.log("fetching next page");
      fetchNextPage({ cancelRefetch: false });
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-2">
      {data.pages.map((page) => {
        return page.data?.map((post) => (
          <PostWrapper key={post.id}>
            <UserPost post={post}>
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

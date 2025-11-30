"use client";

import { use } from "react";
import { ExploreViewEmpty } from "@/components/containers/explore-view/explore-view-empty";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostsProvider } from "@/context/posts-context";
import type { postService } from "@/lib/db/services/post.service";
import type { NestedPost } from "@/types/nested-posts";

export interface ExploreViewPostsProps {
  postsPromise:
    | ReturnType<typeof postService.searchPosts>
    | ReturnType<typeof postService.getTrendingPosts>;
  title?: string;
  showEmptyState?: boolean;
}

/**
 * A beautiful list of posts component for the explorer view
 * Displays posts in a vertical list layout with proper context providers
 */
export function ExploreViewPosts({
  postsPromise,
  title,
  showEmptyState = true,
}: ExploreViewPostsProps) {
  // Adding Promise<unknown> to avoid type errors
  // apparently, apparuse doesn't like type unions
  const posts = use(postsPromise as Promise<unknown>) as Awaited<
    ExploreViewPostsProps["postsPromise"]
  >;
  if (!posts || posts?.data?.length === 0) {
    return showEmptyState ? (
      <section className="space-y-4">
        {title && <h2 className="text-lg font-medium">{title}</h2>} <ExploreViewEmpty />{" "}
      </section>
    ) : null;
  }

  return (
    <section className="space-y-4">
      {title && <h2 className="text-lg font-medium">{title}</h2>}
      <PostsProvider initialPosts={posts as unknown as NestedPost[]}>
        <div className="flex flex-col gap-2">
          {posts?.data?.map((post) => (
            <PostWrapper key={post.id}>
              <UserPost post={post as unknown as NestedPost} />
            </PostWrapper>
          ))}
        </div>
      </PostsProvider>
    </section>
  );
}

"use client";

import { ExplorerViewEmpty } from "@/components/containers/explore-view/explore-view-empty";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostsProvider } from "@/context/posts-context";
import type { postService } from "@/lib/db/services/post.service";
import type { NestedPost } from "@/types/nested-posts";
import { use } from "react";

interface ExplorerViewPostsProps {
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
export function ExplorerViewPosts({
  postsPromise,
  title,
  showEmptyState = true,
}: ExplorerViewPostsProps) {
  // Adding Promise<unknown> to avoid type errors
  // apparently, apparuse doesn't like type unions
  const posts = use(postsPromise as Promise<unknown>) as Awaited<
    ExplorerViewPostsProps["postsPromise"]
  >;
  if (!posts || posts?.data?.length === 0) {
    return showEmptyState ? <ExplorerViewEmpty searchedBy='posts' /> : null;
  }

  return (
    <section className='space-y-4'>
      {title && <h2 className='text-lg font-medium'>{title}</h2>}
      <PostsProvider initialPosts={posts as unknown as NestedPost[]}>
        <div className='flex flex-col gap-2'>
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

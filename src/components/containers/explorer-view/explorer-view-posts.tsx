"use client";

import { ExplorerViewEmpty } from "@/components/containers/explorer-view/explorer-view-empty";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostsProvider } from "@/context/posts-context";
import { postService } from "@/lib/db/services/post.service";
import type { NestedPost } from "@/types/nested-posts";

interface ExplorerViewPostsProps {
  posts?:
    | Awaited<ReturnType<typeof postService.searchPosts>>
    | Awaited<ReturnType<typeof postService.getTrendingPosts>>;
  title?: string;
}

/**
 * A beautiful list of posts component for the explorer view
 * Displays posts in a vertical list layout with proper context providers
 */
export function ExplorerViewPosts({ posts, title }: ExplorerViewPostsProps) {
  if (!posts || posts?.data?.length === 0) {
    return <ExplorerViewEmpty searchedBy='posts' />;
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

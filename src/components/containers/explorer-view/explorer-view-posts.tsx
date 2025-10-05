"use client";

import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostsProvider } from "@/context/posts-context";
import type { getCachedPosts } from "@/lib/db/calls/get-posts";
import type { NestedPost } from "@/types/nested-posts";
import { Button } from "@heroui/react";
import { PaperclipIcon } from "lucide-react";

interface ExplorerViewPostsProps {
  posts?: Awaited<ReturnType<typeof getCachedPosts>>;
  postsSearchTerm?: string;
  onExploreAll?: () => void;
}

/**
 * A beautiful list of posts component for the explorer view
 * Displays posts in a vertical list layout with proper context providers
 */
export function ExplorerViewPosts({
  posts,
  postsSearchTerm,
  onExploreAll,
}: ExplorerViewPostsProps) {
  if (!posts?.data || posts.data.length === 0) {
    return (
      <div className='w-full max-w-[1024px] mx-auto px-4 py-8 flex flex-col justify-center'>
        <div className='text-center py-12'>
          <div className='flex justify-center mb-6'>
            <PaperclipIcon className='w-16 h-16 text-content3' />
          </div>
          <h3 className='text-xl font-semibold text-default-600 mb-2'>
            {postsSearchTerm ? `No posts found for "${postsSearchTerm}"` : "No posts found"}
          </h3>
          <p className='text-default-400'>Try adjusting your search terms or explore all content</p>
        </div>
        <Button variant='flat' color='primary' className='m-auto' onClick={onExploreAll}>
          Explore all content
        </Button>
      </div>
    );
  }

  return (
    <PostsProvider initialPosts={posts as unknown as NestedPost[]}>
      <div className='flex flex-col gap-2'>
        {posts?.data.map((post) => (
          <PostWrapper key={post.id}>
            <UserPost post={post as unknown as NestedPost} />
          </PostWrapper>
        ))}
      </div>
    </PostsProvider>
  );
}

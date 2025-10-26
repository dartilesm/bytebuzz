"use client";

import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostsProvider } from "@/context/posts-context";
import { postService } from "@/lib/db/services/post.service";
import type { NestedPost } from "@/types/nested-posts";
import { Button } from "@heroui/react";
import { PaperclipIcon } from "lucide-react";

interface ExplorerViewPostsProps {
  posts?:
    | Awaited<ReturnType<typeof postService.searchPosts>>
    | Awaited<ReturnType<typeof postService.getTrendingPosts>>;
  postsSearchTerm?: string;
  onExploreAll?: () => void;
}

/**
 * A beautiful list of posts component for the explorer view
 * Displays posts in a vertical list layout with proper context providers
 */
export function ExplorerViewPosts({ posts }: ExplorerViewPostsProps) {
  return (
    <PostsProvider initialPosts={posts as unknown as NestedPost[]}>
      <div className='flex flex-col gap-2'>
        {posts?.data?.map((post) => (
          <PostWrapper key={post.id}>
            <UserPost post={post as unknown as NestedPost} />
          </PostWrapper>
        ))}
      </div>
    </PostsProvider>
  );
}

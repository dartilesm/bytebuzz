"use client";

import { UserCard2 } from "@/components/explore/user-card-2";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostsProvider } from "@/context/posts-context";
import type { getCachedPosts } from "@/lib/db/calls/get-posts";
import type { getCachedTrendingPosts } from "@/lib/db/calls/get-trending-posts";
import type { getCachedTrendingUsers } from "@/lib/db/calls/get-trending-users";
import type { getCachedUsers } from "@/lib/db/calls/get-users";
import type { NestedPost } from "@/types/nested-posts";
import { ScrollShadow } from "@heroui/react";
import type { Tables } from "database.types";
import { FilesIcon } from "lucide-react";

interface ExplorerViewAllProps {
  users?:
    | Awaited<ReturnType<typeof getCachedUsers>>
    | Awaited<ReturnType<typeof getCachedTrendingUsers>>;
  posts?:
    | Awaited<ReturnType<typeof getCachedPosts>>
    | Awaited<ReturnType<typeof getCachedTrendingPosts>>;
  allSearchTerm?: string;
}

/**
 * A comprehensive view component that displays both users and posts
 * Shows empty states when no content is found
 */
export function ExplorerViewAll({ users, posts, allSearchTerm }: ExplorerViewAllProps) {
  const hasUsers = users?.data && users.data.length > 0;
  const hasPosts = posts?.data && posts.data.length > 0;
  const hasAnyContent = hasUsers || hasPosts;

  if (!hasAnyContent) {
    return (
      <div className='w-full max-w-[1024px] mx-auto px-4 py-8 flex flex-col justify-center'>
        <div className='text-center py-12'>
          <div className='flex justify-center mb-6'>
            <FilesIcon className='w-16 h-16 text-content3' />
          </div>
          <h3 className='text-xl font-semibold text-default-600 mb-2'>
            {allSearchTerm ? `No content found for "${allSearchTerm}"` : "No content found"}
          </h3>
          <p className='text-default-400'>
            Try adjusting your search terms or explore other content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-[1024px] mx-auto px-4 py-6 flex flex-col gap-8'>
      {/* Users Section */}
      {hasUsers && (
        <section className='space-y-4'>
          <h2 className='text-lg font-medium'>Users</h2>
          <ScrollShadow
            className='flex gap-4 flex-row scrollbar-auto pb-4'
            orientation='horizontal'
          >
            {users.data.map((user) => (
              <UserCard2 key={user.id} user={user as unknown as Tables<"users">} />
            ))}
          </ScrollShadow>
        </section>
      )}

      {/* Posts Section */}
      {hasPosts && (
        <section className='space-y-4'>
          <h2 className='text-lg font-medium'>Posts</h2>
          <PostsProvider initialPosts={posts as unknown as NestedPost[]}>
            <div className='grid gap-2'>
              {posts.data.map((post) => (
                <PostWrapper key={post.id}>
                  <UserPost post={post as unknown as NestedPost} />
                </PostWrapper>
              ))}
            </div>
          </PostsProvider>
        </section>
      )}
    </div>
  );
}

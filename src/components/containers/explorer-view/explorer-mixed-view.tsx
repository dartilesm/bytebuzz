"use client";

import { UserCard2 } from "@/components/explore/user-card-2";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostsProvider } from "@/context/posts-context";
import type { DbResult } from "@/lib/db/repositories";
import type { getCachedTrendingUsers } from "@/lib/db/calls/get-trending-users";
import type { getCachedUsers } from "@/lib/db/calls/get-users";
import type { NestedPost } from "@/types/nested-posts";
import { ScrollShadow } from "@heroui/react";
import type { Tables } from "database.types";

interface ExplorerMixedViewProps {
  users?:
    | Awaited<ReturnType<typeof getCachedUsers>>
    | Awaited<ReturnType<typeof getCachedTrendingUsers>>;
  posts?: DbResult<any>;
}

/**
 * A beautiful mixed view that displays both users and posts in an integrated layout
 * Designed for the initial explore experience when no search parameters are set
 */
export function ExplorerMixedView({ users, posts }: ExplorerMixedViewProps) {
  const hasUsers = users?.data && users.data.length > 0;
  const hasPosts = posts?.data && posts.data.length > 0;

  return (
    <div className='w-full max-w-[1024px] mx-auto'>
      <div className='flex flex-col gap-2'>
        {/* Featured Users Section */}
        {hasUsers && (
          <section className='space-y-4'>
            <div className='flex items-center gap-3'>
              <h3 className='text-xl font-semibold text-foreground'>People to follow</h3>
            </div>
            <ScrollShadow
              className='flex gap-2 flex-row scrollbar-auto pb-4 overflow-x-auto'
              orientation='horizontal'
            >
              {users.data.map((user) => (
                <UserCard2 key={user.id} user={user as unknown as Tables<"users">} />
              ))}
            </ScrollShadow>
          </section>
        )}

        {/* Trending Posts Section */}
        {hasPosts && (
          <section className='space-y-4'>
            <div className='flex items-center gap-3'>
              <h3 className='text-xl font-semibold text-foreground'>Trending posts</h3>
            </div>
            <PostsProvider initialPosts={posts as unknown as NestedPost[]}>
              <div className='grid gap-3'>
                {posts.data.slice(0, 6).map((post: any) => (
                  <PostWrapper key={post.id}>
                    <UserPost post={post as unknown as NestedPost} />
                  </PostWrapper>
                ))}
              </div>
            </PostsProvider>
          </section>
        )}
      </div>
    </div>
  );
}

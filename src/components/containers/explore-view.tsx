"use client";

import { SearchBox } from "@/components/explore/search-box";
import { UserCard2 } from "@/components/explore/user-card-2";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PageHeader } from "@/components/ui/page-header";
import { PostsProvider } from "@/context/posts-context";
import { exploreMockData } from "@/lib/mock/explore-data";
import { Alert, ScrollShadow } from "@heroui/react";
import type { Tables } from "database.types";

interface ExploreViewProps {
  users: Tables<"users">[];
}

export function ExploreView({ users }: ExploreViewProps) {
  return (
    <>
      <PageHeader title='Explore' className='bg-transparent backdrop-blur-none'>
        <SearchBox placeholder='Search users or posts...' />
      </PageHeader>
      <Alert
        color='warning'
        title='Mocked page'
        description='This is a demo showcasing the explore page, it is not showing real data.'
      />
      <div className='w-full max-w-[1024px] mx-auto px-4 py-6 flex flex-col gap-8'>
        {/* Users Section */}
        <section className='space-y-4'>
          <h2 className='text-lg font-medium'>Users</h2>
          <ScrollShadow
            className='flex gap-4 flex-row scrollbar-auto pb-4'
            orientation='horizontal'
          >
            {users.map((user) => (
              <UserCard2 key={user.id} user={user as Tables<"users">} />
            ))}
            {users.length === 0 && <p className='text-center text-default-500'>No users found</p>}
          </ScrollShadow>
        </section>

        {/* Posts Section */}
        <section className='space-y-4'>
          <h2 className='text-lg font-medium'>{"Related Posts"}</h2>
          <PostsProvider initialPosts={exploreMockData.posts}>
            <div className='grid gap-4'>
              {exploreMockData.posts.map((post) => (
                <PostWrapper key={post.id}>
                  <UserPost post={post} />
                </PostWrapper>
              ))}
            </div>
          </PostsProvider>
        </section>
      </div>
    </>
  );
}

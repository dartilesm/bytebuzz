"use client";

import { SearchBox } from "@/components/explore/search-box";
import { UserCard2 } from "@/components/explore/user-card-2";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PageHeader } from "@/components/ui/page-header";
import { PostsProvider } from "@/context/posts-context";
import type { getCachedPosts } from "@/lib/db/calls/get-posts";
import type { getCachedUsers } from "@/lib/db/calls/get-users";
import type { NestedPost } from "@/types/nested-posts";
import { ScrollShadow } from "@heroui/react";
import type { Tables } from "database.types";
import { parseAsString, useQueryState } from "nuqs";

interface ExploreViewProps {
  users?: Awaited<ReturnType<typeof getCachedUsers>>;
  posts?: Awaited<ReturnType<typeof getCachedPosts>>;
}

export function ExploreView({ users, posts }: ExploreViewProps) {
  const [searchTerm, setSearchTerm] = useQueryState(
    "searchTerm",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  function handleSearch(term: string) {
    setSearchTerm(term);
  }

  return (
    <>
      <PageHeader title='Explore' className='pr-4'>
        <SearchBox
          placeholder='Search users or posts...'
          onSearch={handleSearch}
          initialSearchTerm={searchTerm}
        />
      </PageHeader>
      <div className='w-full max-w-[1024px] mx-auto px-4 py-6 flex flex-col gap-8'>
        {/* Users Section */}
        {users?.data && users.data.length > 0 && (
          <section className='space-y-4'>
            <h2 className='text-lg font-medium'>Users</h2>
            <ScrollShadow
              className='flex gap-4 flex-row scrollbar-auto pb-4'
              orientation='horizontal'
            >
              {users.data.map((user) => (
                <UserCard2 key={user.id} user={user as unknown as Tables<"users">} />
              ))}
              {users.data.length === 0 && (
                <p className='text-center text-default-500'>No users found</p>
              )}
            </ScrollShadow>
          </section>
        )}

        {/* Posts Section */}
        {posts?.data && posts.data.length > 0 && (
          <section className='space-y-4'>
            <h2 className='text-lg font-medium'>{"Posts"}</h2>
            <PostsProvider initialPosts={posts as unknown as NestedPost[]}>
              <div className='grid gap-4'>
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
    </>
  );
}

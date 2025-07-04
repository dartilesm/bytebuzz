"use client";

import { UserPostLoading } from "@/components/loading/user-post.loading";
import { PostComposer } from "@/components/post-composer/post-composer";
import { PageHeader } from "@/components/ui/page-header";
import { PostsProvider } from "@/context/posts-context";

export function ThreadLoadingPosts() {
  return (
    <>
      <PageHeader title="Thread" />
      <div className="flex flex-col gap-4 w-full">
        <PostsProvider initialPosts={[]}>
          <UserPostLoading />
          <PostComposer />
          <div className="flex flex-col gap-4 min-h-[100dvh]">
            <span>Replies</span>
            <UserPostLoading />
            <UserPostLoading />
          </div>
        </PostsProvider>
      </div>
    </>
  );
}

"use client";

import type { NestedPost } from "@/types/nested-posts";
import { createContext, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostsContextType {
  posts: NestedPost[];
  addPost: (post: NestedPost) => void;
  setPosts: (posts: NestedPost[]) => void;
}

export const PostsContext = createContext<PostsContextType | null>(null);

/**
 * Provider component that wraps your app and makes posts state available to any
 * child component that calls usePostsContext().
 */
export function PostsProvider({
  children,
  initialPosts,
}: {
  children: React.ReactNode;
  initialPosts: NestedPost[];
}) {
  const [posts, setPosts] = useState<NestedPost[]>(initialPosts);
  const router = useRouter();

  function addPost(post: NestedPost) {
    toast.success("Post added", {
      description: "Your post has been added successfully",
      action: {
        label: "View",
        onClick: () => router.push(`/@${post.user?.username}/thread/${post.id}`),
      },
    });
    setPosts([post, ...posts]);
  }

  return (
    <PostsContext.Provider value={{ posts, addPost, setPosts }}>{children}</PostsContext.Provider>
  );
}

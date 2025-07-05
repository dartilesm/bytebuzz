"use client";

import type { NestedPost } from "@/types/nested-posts";
import { Button, Link, addToast } from "@heroui/react";
import { createContext, useState } from "react";

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

  function addPost(post: NestedPost) {
    addToast({
      title: "Post added",
      description: "Your post has been added successfully",
      variant: "flat",
      color: "success",
      endContent: (
        <Button
          as={Link}
          href={`/@${post.user?.username}/thread/${post.id}`}
          variant="flat"
          color="success"
          size="sm"
        >
          View
        </Button>
      ),
    });
    setPosts([post, ...posts]);
  }

  return (
    <PostsContext.Provider value={{ posts, addPost, setPosts }}>{children}</PostsContext.Provider>
  );
}

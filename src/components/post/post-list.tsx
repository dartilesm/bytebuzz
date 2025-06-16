"use client";

import { CondensedUserPost } from "@/components/post/condensed-user-post";
import { PostWrapper } from "@/components/post/post-wrapper";
import { usePostsContext } from "@/hooks/use-posts-context";
import { AnimatePresence, motion } from "motion/react";
import { UserPost } from "./user-post";

export function PostList() {
  const { posts } = usePostsContext();

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, y: -50 }} // Initial animation values
            animate={{ opacity: 1, y: 0 }} // Animation values when entering
            exit={{ opacity: 0, y: 50 }} // Animation values when exiting
            transition={{ duration: 0.3 }} // Animation duration
          >
            <PostWrapper>
              <UserPost post={post}>
                {post.repost && <CondensedUserPost post={post.repost} />}
              </UserPost>
            </PostWrapper>
          </motion.div>
        ))}
      </AnimatePresence>
      {posts.length === 0 && (
        <span className="text-center text-sm text-muted-foreground">No posts found</span>
      )}
    </div>
  );
}

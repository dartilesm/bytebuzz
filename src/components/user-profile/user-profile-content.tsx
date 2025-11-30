"use client";

import { PostList } from "@/components/post/post-list";
import { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { PostsProvider } from "@/context/posts-context";
import type { postService } from "@/lib/db/services/post.service";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { use, useState } from "react";

const enum UserProfileTabs {
  POSTS = "posts",
  MEDIA = "media",
  LIKES = "likes",
}

const tabOrder = [UserProfileTabs.POSTS, UserProfileTabs.MEDIA, UserProfileTabs.LIKES];

interface UserProfileContentProps {
  postsPromise: ReturnType<typeof postService.getUserPosts>;
}

export function UserProfileContent({ postsPromise }: UserProfileContentProps) {
  const postsResponse = use(postsPromise as Promise<unknown>) as Awaited<
    ReturnType<typeof postService.getUserPosts>
  >;
  const posts = postsResponse.data ?? [];

  const [activeTab, setActiveTab] = useState<UserProfileTabs>(UserProfileTabs.POSTS);
  const [previousTab, setPreviousTab] = useState<UserProfileTabs>(UserProfileTabs.POSTS);

  /**
   * Determines the slide direction based on the tab order
   */
  function getSlideDirection(current: UserProfileTabs, previous: UserProfileTabs) {
    const currentIndex = tabOrder.indexOf(current);
    const previousIndex = tabOrder.indexOf(previous);

    return currentIndex > previousIndex ? "right" : "left";
  }

  /**
   * Handles the tab change and updates the previous tab state
   */
  function handleTabChange(key: string | number) {
    setPreviousTab(activeTab);
    setActiveTab(key as UserProfileTabs);
  }

  const slideVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0,
    }),
  };

  const direction = getSlideDirection(activeTab, previousTab);

  return (
    <div className="flex flex-col gap-2">
      <Tabs
        value={activeTab}
        onValueChange={(value) => handleTabChange(value)}
        className="w-full sticky md:top-16 top-14 z-40 bg-background"
        variant="underline"
      >
        <TabsList className="w-full justify-around rounded-none border-b border-border bg-transparent p-0 gap-0 sticky top-14 md:top-16 z-40">
          <TabsTrigger value={UserProfileTabs.POSTS}>Posts</TabsTrigger>
          <TabsTrigger value={UserProfileTabs.MEDIA}>Media</TabsTrigger>
          <TabsTrigger value={UserProfileTabs.LIKES}>Likes</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="py-4 overflow-hidden px-2 md:px-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.1 }}
            className="w-full"
          >
            {activeTab === UserProfileTabs.POSTS && (
              <PostsProvider initialPosts={posts}>
                <PostList postQueryType={POST_QUERY_TYPE.USER_POSTS} />
              </PostsProvider>
            )}
            {activeTab === UserProfileTabs.MEDIA && (
              <p className="text-default-500">No media posts yet.</p>
            )}
            {activeTab === UserProfileTabs.LIKES && (
              <p className="text-default-500">No liked posts yet.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

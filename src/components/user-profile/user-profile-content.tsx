"use client";

import { PostList } from "@/components/post/post-list";
import { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { PostsProvider } from "@/context/posts-context";
import type { NestedPost } from "@/types/nested-posts";
import { Tab, Tabs } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

enum UserProfileTabs {
  POSTS = "posts",
  MEDIA = "media",
  LIKES = "likes",
}

const tabOrder = [UserProfileTabs.POSTS, UserProfileTabs.MEDIA, UserProfileTabs.LIKES];

interface UserProfileContentProps {
  posts: NestedPost[];
}

export function UserProfileContent({ posts }: UserProfileContentProps) {
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
        aria-label="Profile sections"
        variant="underlined"
        color="primary"
        className="sticky top-16 z-30 backdrop-blur-xl bg-background/70"
        classNames={{
          tabList: "w-full",
        }}
        selectedKey={activeTab}
        onSelectionChange={handleTabChange}
      >
        <Tab key={UserProfileTabs.POSTS} title="Posts" />
        <Tab key={UserProfileTabs.MEDIA} title="Media" />
        <Tab key={UserProfileTabs.LIKES} title="Likes" />
      </Tabs>
      <div className="py-4 overflow-hidden">
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

"use client";

import { cn } from "@/lib/utils";
import type { NestedPost } from "@/types/nested-posts";
import { useEffect, useRef } from "react";
import { UserPost } from "./user-post";

interface UserPostThreadProps {
  posts: NestedPost[];
}

export function UserPostThread({ posts }: UserPostThreadProps) {
  const lastPostRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFirstAndLastPost = posts.length === 1;

  useEffect(scrollToLastPost, [posts]);

  function scrollToLastPost() {
    if (lastPostRef.current && containerRef.current) {
      const headerOffset = 64;
      const elementPosition = lastPostRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "instant",
      });
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col w-full">
      {posts.map((post, index) => (
        <UserPost
          key={post.id}
          // @ts-expect-error - The ref type is correct but TypeScript is having trouble with the conditional
          ref={index === posts.length - 1 ? lastPostRef : undefined}
          isThread={posts.length > 1}
          isFirstInThread={isFirstAndLastPost || index === 0}
          isLastInThread={isFirstAndLastPost || index === posts.length - 1}
          post={post}
          className={cn(
            "dark:border-content2 border border-content3 bg-default-200/20 dark:bg-content1",
            {
              "max-w-[calc(100%-2rem)] mx-auto dark:bg-content2/70 rounded-none border-t-0":
                index < posts.length - 1,
              "rounded-t-xl border-t border-x border-b-0": index === 0,
            },
          )}
        />
      ))}
    </div>
  );
}

/* 
    background: transparent;
    border: none;
*/

/* 
    max-width: calc(100% - 30px);
    margin-inline: auto;
    background-color: #29292d;
    border-radius: 0;
*/

"use client";

import type { MouseEvent } from "react";
import { PostAvatarAndThreadLine } from "@/components/post/post-avatar-and-thread-line";
import { Card } from "@/components/ui/card";
import type { PostClickEvent } from "@/context/post-provider";
import { usePostContext } from "@/hooks/use-post-context";
import { cn } from "@/lib/utils";

interface PostCardProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
}

export function PostCard({ children, className, ref }: PostCardProps) {
  const { post, isThreadPagePost, isNavigationDisabled, onPostClick } = usePostContext();

  function handlePostClick(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target as HTMLElement).hasAttribute("data-non-propagatable"))
      onPostClick(event as PostClickEvent);
  }

  return (
    <div onClick={handlePostClick} ref={ref} id={`post-${post.id}`} className="scroll-mt-20">
      <Card
        className={cn(
          "relative flex flex-row dark:bg-card bg-card shadow-none overflow-hidden py-0 gap-0 border-0",
          {
            "cursor-pointer": !isNavigationDisabled,
          },
          className,
        )}
        tabIndex={0}
      >
        {!isThreadPagePost && <PostAvatarAndThreadLine />}
        <div className="flex-1 min-w-0">{children}</div>
      </Card>
    </div>
  );
}

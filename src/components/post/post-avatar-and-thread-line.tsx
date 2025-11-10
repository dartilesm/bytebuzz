"use client";

import { PostThreadLine } from "@/components/post/post-thread-line";
import { UserProfilePopoverCard } from "@/components/user-profile/user-profile-popover-card";
import { usePostContext } from "@/hooks/use-post-context";
import { cn } from "@/lib/utils";
import { Avatar, Tooltip } from "@heroui/react";
import Link from "next/link";

export function PostAvatarAndThreadLine() {
  const { isThread, isFirstInThread, isLastInThread, isThreadPagePost, post } = usePostContext();
  const { user } = post;

  return (
    <div
      className={cn("flex py-2 md:py-4 pl-2 md:pl-4 pr-1 md:pr-2 justify-center relative", {
        "pl-2 md:pl-4.5": isThreadPagePost,
      })}
    >
      <Link href={`/@${user?.username}`} className='h-fit'>
        <Tooltip content={<UserProfilePopoverCard user={user} />} delay={1000}>
          <Avatar
            isBordered
            src={user?.image_url ?? ""}
            alt={user?.display_name ?? ""}
            className={cn("flex-shrink-0 z-20", {
              "size-8 md:size-9": !isThreadPagePost,
            })}
          />
        </Tooltip>
      </Link>
      {/* Thread Line Container */}
      {isThread && (
        <PostThreadLine
          className={cn({
            "top-8 h-[calc(100%-2rem)]": isFirstInThread,
            "top-0 h-4": isLastInThread,
          })}
        />
      )}
    </div>
  );
}

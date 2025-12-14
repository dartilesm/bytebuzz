"use client";

import Link from "next/link";
import { PostThreadLine } from "@/components/post/post-thread-line";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { UserProfilePopoverContent } from "@/components/user-profile/user-profile-popover-content";
import { usePostContext } from "@/hooks/use-post-context";
import { cn } from "@/lib/utils";

export function PostAvatarAndThreadLine() {
  const { isThread, isFirstInThread, isLastInThread, isThreadPagePost, post } = usePostContext();
  const { user } = post;

  return (
    <div
      className={cn("flex py-2 md:py-4 pl-2 md:pl-4 pr-1 md:pr-2 justify-center relative", {
        "pl-1 md:pl-3.5": isThreadPagePost,
      })}
    >
      <TooltipProvider delayDuration={1000}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/@${user?.username}`} className="h-fit">
              <UserAvatar
                user={user}
                className={cn(
                  "shrink-0 z-20 outline-2 outline-border border-background border-2 size-10 md:size-11",
                  {
                    "size-9 md:size-10": !isThreadPagePost,
                  },
                )}
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent className="min-w-xs">
            <UserProfilePopoverContent user={user} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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

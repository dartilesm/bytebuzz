"use client";

import { PostAvatarAndThreadLine } from "@/components/post/post-avatar-and-thread-line";
import { UserProfilePopoverCard } from "@/components/user-profile/user-profile-popover-card";
import { usePostContext } from "@/hooks/use-post-context";
import { formatDateTime } from "@/lib/format-time";
import { getRelativeTime } from "@/lib/relative-time";
import { CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function PostHeader() {
  const { isThreadPagePost, post } = usePostContext();
  const { user, created_at } = post;

  return (
    <CardHeader
      className={cn("flex items-center gap-2 md:gap-4 pb-2 flex-1 px-2 md:px-4", {
        "py-0 pr-2 md:pr-8.5": isThreadPagePost,
      })}
    >
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center gap-1 md:gap-1.5 min-w-0'>
          {isThreadPagePost && <PostAvatarAndThreadLine />}
          <TooltipProvider>
            <Tooltip delayDuration={1000}>
              <TooltipTrigger asChild>
                <Link
                  href={`/@${user?.username}`}
                  className={cn("flex flex-row gap-1 md:gap-2 items-center min-w-0", {
                    "flex-col gap-0 items-start": isThreadPagePost,
                  })}
                >
                  <span className='font-semibold text-sm md:text-base truncate'>
                    {user?.display_name}
                  </span>
                  <span className='text-xs md:text-sm text-muted-foreground/50 truncate'>
                    @{user?.username}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <UserProfilePopoverCard user={user} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {!isThreadPagePost && (
            <>
              <span className='text-xs md:text-sm text-muted-foreground/50'>·</span>
              <time
                className='text-xs md:text-sm text-muted-foreground/50'
                title={formatDateTime(created_at as unknown as Date)}
              >
                {getRelativeTime(new Date(created_at as unknown as Date))}
              </time>
            </>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

"use client";

import { PostThreadLine } from "@/components/post/post-thread-line";
import { UserProfilePopoverContent } from "@/components/user-profile/user-profile-popover-content";
import { usePostContext } from "@/hooks/use-post-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
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
      <TooltipProvider delayDuration={1000}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/@${user?.username}`} className='h-fit'>
              <Avatar
                className={cn("shrink-0 z-20 border-2 border-border", {
                  "size-8 md:size-9": !isThreadPagePost,
                })}
              >
                <AvatarImage src={user?.image_url ?? ""} alt={user?.display_name ?? ""} />
                <AvatarFallback>{user?.display_name?.[0] ?? ""}</AvatarFallback>
              </Avatar>
            </Link>
          </TooltipTrigger>
          <TooltipContent className="border bg-card min-w-xs">
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

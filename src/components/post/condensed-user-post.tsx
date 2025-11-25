"use client";

import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import { UserProfilePopoverContent } from "@/components/user-profile/user-profile-popover-content";
import { PostProvider } from "@/context/post-provider";
import { formatDateTime } from "@/lib/format-time";
import { getRelativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import type { NestedPost } from "@/types/nested-posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface CondensedUserPostProps {
  post: NestedPost;
  className?: string;
  /**
   * Controls whether the avatar and username have hover effects and tooltips
   * @default false
   */
  isInteractive?: boolean;
  /**
   * When true, disables click-to-navigate interaction on the post
   * @default false
   */
  isNavigationDisabled?: boolean;
}

/**
 * A condensed version of a user post, typically used for reposted content
 * Supports click navigation to the post's thread page
 */
export function CondensedUserPost({
  post,
  className,
  isInteractive = false,
  isNavigationDisabled = false,
}: CondensedUserPostProps) {
  const { user, content, created_at } = post;
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handles click events to navigate to the post's thread page
   * Prevents navigation if clicking on anchor elements or if navigation is disabled
   * Stops event propagation to prevent parent PostCard from handling the click
   */
  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const isAnchorElement = (event.target as HTMLElement).closest("a");
    if (isAnchorElement || isNavigationDisabled || !post.id || !user?.username) {
      return;
    }

    // Stop event propagation to prevent parent PostCard from handling the click
    event.stopPropagation();

    const pushPath = `/@${user.username}/thread/${post.id}` as `/${string}/thread/${string}`;

    if (pathname !== pushPath) {
      router.push(pushPath);
    }
  }

  /**
   * Handles keyboard events for accessibility
   * Allows navigation with Enter or Space key
   * Stops event propagation to prevent parent PostCard from handling the keydown
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isNavigationDisabled || !post.id || !user?.username) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // Stop event propagation to prevent parent PostCard from handling the keydown
      event.stopPropagation();

      const pushPath = `/@${user.username}/thread/${post.id}` as `/${string}/thread/${string}`;

      if (pathname !== pushPath) {
        router.push(pushPath);
      }
    }
  }

  return (
    <PostProvider post={post} isThread={false} isNavigationDisabled={isNavigationDisabled}>
      <div onClick={handleClick} onKeyDown={handleKeyDown}>
        <Card
          className={cn(
            "relative flex flex-row gap-2 p-2 bg-muted/40 border shadow-none transition-all duration-200",
            {
              "cursor-pointer hover:bg-muted/60 hover:border-muted-foreground/20":
                !isNavigationDisabled,
            },
            className
          )}
          tabIndex={isNavigationDisabled ? undefined : 0}
          role={isNavigationDisabled ? undefined : "button"}
          aria-label={
            isNavigationDisabled
              ? undefined
              : `View post by ${user?.display_name || user?.username}`
          }
        >
          <div className='flex justify-center relative pt-1'>
            {isInteractive ? (
              <Link href={`/@${user?.username}`} className='h-fit'>
                <TooltipProvider>
                  <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                      <div><UserAvatar user={user} /></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <UserProfilePopoverContent user={user} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            ) : (
              <UserAvatar user={user} />
            )}
          </div>

          <div className='w-full overflow-hidden'>
            <CardHeader className='flex items-center gap-2 pb-1 flex-1 p-0 space-y-0'>
              <div className='flex items-center justify-between w-full'>
                <div className='flex items-center gap-1.5'>
                  {isInteractive ? (
                    <TooltipProvider>
                      <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                          <Link href={`/@${user?.username}`}>
                            <UserInfo user={user} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <UserProfilePopoverContent user={user} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <UserInfo user={user} />
                  )}
                  <span className='text-xs text-muted-foreground/50'>·</span>
                  <time
                    className='text-xs text-muted-foreground/50'
                    title={formatDateTime(created_at as unknown as Date)}
                  >
                    {getRelativeTime(new Date(created_at as unknown as Date))}
                  </time>
                </div>
              </div>
            </CardHeader>

            <CardContent className='text-sm gap-2 p-2 pt-0'>
              <MarkdownViewer markdown={content ?? ""} postId={post.id ?? ""} />
            </CardContent>
          </div>
        </Card>
      </div>
    </PostProvider>
  );
}

function UserInfo({ user }: { user: NestedPost["user"] }) {
  return (
    <div className='flex flex-row gap-1 items-center'>
      <span className='font-semibold text-sm'>{user?.display_name}</span>
      <span className='text-xs text-muted-foreground/50'>@{user?.username}</span>
    </div>
  );
}

function UserAvatar({ user }: { user: NestedPost["user"] }) {
  return (
    <Avatar className='size-6 shrink-0 z-20'>
      <AvatarImage src={user?.image_url ?? ""} alt={user?.display_name ?? ""} />
      <AvatarFallback>{user?.display_name?.[0]}</AvatarFallback>
    </Avatar>
  );
}

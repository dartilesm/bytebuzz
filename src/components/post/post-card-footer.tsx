"use client";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToggleReactionMutation } from "@/hooks/mutation/use-toggle-reaction-mutation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { usePostContext } from "@/hooks/use-post-context";
import { cn } from "@/lib/utils";
import type { NestedPost } from "@/types/nested-posts";
import { SiX } from "@icons-pack/react-simple-icons";
import { CopyIcon, MessageSquareIcon, RepeatIcon, Share2Icon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import {
  type Reaction,
  getReactionsWithCounts,
  getSortedReactions,
  getTotalReactions,
} from "./functions/reactions-utils";

const reactions: Reaction[] = [
  { type: "star", icon: "🌟", label: "Star" },
  { type: "coffee", icon: "☕", label: "Give a coffe" },
  { type: "approve", icon: "✔︎", label: "Approve" },
  { type: "cache", icon: "🧠", label: "Cache" },
];

function getPostUrl(post: NestedPost) {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/${post.user.username}/thread/${post.id}`;
  }
  return `http://localhost:3000/${post.user.username}/thread/${post.id}`;
}

function getXPostPreview(post: NestedPost) {
  const content = `Check out this post by @${post.user.username} on ByteBuzz 🚀!
  %0A%0AJoin the conversation at bytebuzz.dev - where developers share insights, code, and connect! 💻✨
  %0A%0A${getPostUrl(post)}`;

  return `https://x.com/intent/post?text=${content}`;
}

function shareUrl(post: NestedPost) {
  const url = getPostUrl(post);
  navigator.share({
    text: post.content || "Check out this post on ByteBuzz!",
    url,
  });
}

export function PostFooter() {
  const { isThreadPagePost, togglePostModal, post, isNavigationDisabled } = usePostContext();
  const [selectedReaction, setSelectedReaction] = useState<Reaction["type"] | null>(
    post.reaction?.reaction_type ?? null,
  );
  const toggleReactionMutation = useToggleReactionMutation();

  const { withAuth } = useAuthGuard();

  function handleReaction(reaction: Reaction["type"]) {
    if (!post?.id) return;
    const lastReaction = selectedReaction;

    setSelectedReaction((prev) => (prev === reaction ? null : reaction));
    toggleReactionMutation.mutate(
      {
        post_id: post.id,
        reaction_type: reaction,
      },
      {
        onError: () => {
          setSelectedReaction(lastReaction);
        },
      },
    );
  }

  function copyUrl(post: NestedPost) {
    const url = getPostUrl(post);
    navigator.clipboard.writeText(url);
    navigator.clipboard.writeText(url);
    toast.success("Post link copied to clipboard");
  }

  // Use utility functions for reactions logic
  const reactionsWithCounts = getReactionsWithCounts(
    post,
    reactions,
    post.reaction?.reaction_type ?? null,
  );
  const sortedReactions = getSortedReactions(reactionsWithCounts);
  const totalReactions = getTotalReactions(sortedReactions);

  const hasReactions = sortedReactions.length > 0;

  return (
    <>
      <CardFooter
        className={cn("z-30 flex flex-col w-full px-2 md:px-4 pt-2", {
          "pb-2": !hasReactions,
          "gap-2 pb-1": hasReactions,
        })}
        id="post-card-footer"
      >
        {!isNavigationDisabled && (
          <>
            {/* Legend: All reactions ordered + total counter */}
            {hasReactions && (
              <div
                className={cn("flex flex-row items-center ml-1 md:ml-2 w-full gap-1 md:gap-2", {
                  "px-2 md:px-3.5": isThreadPagePost,
                })}
                aria-label="Reactions legend"
              >
                <div className="flex flex-row items-center">
                  {sortedReactions.map((reaction, reactionIndex) => (
                    <span
                      key={reaction.type}
                      className={cn(
                        "px-1 opacity-70 size-6 text-xs rounded-full dark:bg-content2 bg-content4 flex items-center justify-center",
                        {
                          "-ml-2": reactionIndex > 0,
                          "z-4": reactionIndex === 0,
                          "z-3": reactionIndex === 1,
                          "z-2": reactionIndex === 2,
                          "z-1": reactionIndex === 3,
                        },
                      )}
                      aria-label={reaction.label}
                    >
                      <span aria-hidden="true">{reaction.icon}</span>
                    </span>
                  ))}
                </div>
                {totalReactions > 0 && (
                  <span className="text-muted-foreground text-xs" aria-label="Total reactions">
                    {totalReactions}
                  </span>
                )}
              </div>
            )}
            {hasReactions && (
              <Separator
                className={cn("dark:bg-muted bg-border", {
                  "w-[calc(100%-(var(--spacing)*8.5))]": isThreadPagePost,
                })}
              />
            )}
            <div
              className={cn("z-30 flex flex-row gap-1 md:gap-2 justify-between w-full", {
                "md:px-3.5": isThreadPagePost,
              })}
            >
              {/* Reaction Button with Tooltip (original) */}
              <PostFooterReactionButton
                selectedReaction={selectedReaction}
                onReactionClick={handleReaction}
              />

              {/* Comment Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={Boolean(post?.reply_count) ? "sm" : "icon"}
                      className="flex flex-row gap-1 md:gap-2 text-muted-foreground min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 px-2"
                      onClick={withAuth(() => togglePostModal(true, "reply"))}
                      aria-label="Comment"
                    >
                      <MessageSquareIcon className="text-inherit" size={18} />
                      {Boolean(post?.reply_count) && (
                        <span className="text-sm">{post?.reply_count}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Other Buttons (Repost, Backup, More) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                      onClick={withAuth(() => togglePostModal(true, "clone"))}
                      aria-label="Repost"
                    >
                      <RepeatIcon className="text-inherit" size={26} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Repost</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground max-w-32 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 px-2"
                          aria-label="Share"
                        >
                          <Share2Icon className="text-inherit" size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem key="x" asChild>
                        <Link
                          href={getXPostPreview(post) as any}
                          target="_blank"
                          className="flex items-center"
                        >
                          <SiX className="text-inherit mr-2" size={16} />
                          Share on X
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem key="copy" onClick={() => copyUrl(post)}>
                        <CopyIcon className="text-inherit mr-2" size={16} />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem key="native" onClick={() => shareUrl(post)}>
                        <Share2Icon className="text-inherit mr-2" size={16} />
                        Share via ...
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <TooltipContent>
                    <p>Share</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}
      </CardFooter>
    </>
  );
}

function PostFooterReactionButton({
  onReactionClick,
  selectedReaction,
}: {
  onReactionClick?: (reaction: Reaction["type"]) => void;
  selectedReaction: Reaction["type"] | null;
}) {
  const [isReactionsTooltipOpen, setIsReactionsTooltipOpen] = useState(false);
  const debouncedSetIsReactionsTooltipOpen = useDebounceCallback(setIsReactionsTooltipOpen, 300);

  function handleReactionTooltipOpen(state: boolean) {
    if (state) {
      debouncedSetIsReactionsTooltipOpen.cancel();
    }

    return setIsReactionsTooltipOpen(state);
  }

  function handleReactionClick(reaction: Reaction["type"] | null) {
    const [firstReaction] = reactions;

    // If no reaction is selected, use the first reaction or the selected reaction
    // the selected reaction will be sent to undo post reaction
    onReactionClick?.(reaction ?? selectedReaction ?? firstReaction.type);
    handleReactionTooltipOpen(false);
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0} open={isReactionsTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            variant={!selectedReaction ? "ghost" : "flat"}
            size={!selectedReaction ? "icon" : "sm"}
            onClick={() => handleReactionClick(selectedReaction)}
            onMouseEnter={() => handleReactionTooltipOpen(true)}
            onMouseLeave={() => debouncedSetIsReactionsTooltipOpen(false)}
            className={cn(
              "group flex items-center gap-1 md:gap-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 px-2",
              {
                "text-muted-foreground": !selectedReaction,
              },
            )}
          >
            {selectedReaction && (
              <span className="text-lg">
                {reactions.find((r) => r.type === selectedReaction)?.icon}
              </span>
            )}
            {!selectedReaction && (
              <span className="text-lg">
                <StarIcon className="text-inherit" size={18} />
              </span>
            )}
            {selectedReaction && <span className="text-sm capitalize">{selectedReaction}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="flex flex-row gap-2 p-1 z-0 max-h-12"
          onMouseEnter={() => handleReactionTooltipOpen(true)}
          onMouseLeave={() => handleReactionTooltipOpen(false)}
        >
          <TooltipProvider>
            {reactions.map((reaction) => (
              <Tooltip key={reaction.type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 group h-10 w-10 hover:w-14 hover:scale-150 transition-all duration-200 origin-bottom hover:bg-transparent dark:hover:bg-transparent"
                    onClick={() => handleReactionClick?.(reaction.type)}
                  >
                    <span className="text-xl group-hover:text-3xl transition-all duration-200">
                      {reaction.icon}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{reaction.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  /*   return (
      <div {...props}>
        <TooltipProvider>
          {reactions.map((reaction) => (
            <Tooltip key={reaction.type}>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='p-2 group h-10 w-10'
                  onClick={() => onReactionClick?.(reaction.type)}
                >
                  <span className='text-xl group-hover:text-3xl transition-all duration-200'>
                    {reaction.icon}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{reaction.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    ); */
}

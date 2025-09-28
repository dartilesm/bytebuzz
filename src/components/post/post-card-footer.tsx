"use client";

import { useToggleReactionMutation } from "@/hooks/mutation/use-toggle-reaction-mutation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { usePostContext } from "@/hooks/use-post-context";
import type { NestedPost } from "@/types/nested-posts";
import {
  Button,
  CardFooter,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Tooltip,
  addToast,
  cn,
} from "@heroui/react";
import { SiX } from "@icons-pack/react-simple-icons";
import { CopyIcon, MessageSquareIcon, Repeat2Icon, Share2Icon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
    post.reaction?.reaction_type ?? null
  );
  const [isReactionsTooltipOpen, setIsReactionsTooltipOpen] = useState(false);

  const toggleReactionMutation = useToggleReactionMutation();

  const { withAuth } = useAuthGuard();

  /**
   * Handles toggling a reaction on a post
   * @param reaction - The type of reaction to toggle
   */
  function handleReaction(reaction: Reaction["type"]) {
    setIsReactionsTooltipOpen(false);
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
      }
    );
  }

  function copyUrl(post: NestedPost) {
    const url = getPostUrl(post);
    navigator.clipboard.writeText(url);
    addToast({
      title: "Post link copied to clipboard",
      color: "success",
    });
  }

  // Use utility functions for reactions logic
  const reactionsWithCounts = getReactionsWithCounts(
    post,
    reactions,
    post.reaction?.reaction_type ?? null
  );
  const sortedReactions = getSortedReactions(reactionsWithCounts);
  const totalReactions = getTotalReactions(sortedReactions);

  return (
    <>
      <CardFooter className={cn("z-30 flex flex-col gap-1 w-full")}>
        {!isNavigationDisabled && (
          <>
            {/* Legend: All reactions ordered + total counter */}
            {sortedReactions.length > 0 && (
              <div
                className={cn("flex flex-row items-center ml-2 w-full gap-2 py-1", {
                  "px-3.5": isThreadPagePost,
                })}
                aria-label='Reactions legend'
              >
                <div className='flex flex-row items-center'>
                  {sortedReactions.map((reaction, reactionIndex) => (
                    <span
                      key={reaction.type}
                      className={cn(
                        "px-1 opacity-70 size-6 text-xs rounded-full dark:bg-content2 bg-content4 flex items-center justify-center",
                        {
                          "-ml-2": reactionIndex > 0,
                          "z-[4]": reactionIndex === 0,
                          "z-[3]": reactionIndex === 1,
                          "z-[2]": reactionIndex === 2,
                          "z-[1]": reactionIndex === 3,
                        }
                      )}
                      aria-label={reaction.label}
                    >
                      <span aria-hidden='true'>{reaction.icon}</span>
                    </span>
                  ))}
                </div>
                {totalReactions > 0 && (
                  <span className='text-gray-400 text-xs' aria-label='Total reactions'>
                    {totalReactions}
                  </span>
                )}
              </div>
            )}
            <Divider
              className={cn("dark:bg-default-100 bg-default-200", {
                "w-[calc(100%-(var(--spacing)*8.5))]": isThreadPagePost,
              })}
            />
            <div
              className={cn("z-30 flex flex-row gap-2 justify-between w-full", {
                "px-3.5": isThreadPagePost,
              })}
            >
              {/* Reaction Button with Tooltip (original) */}
              <Tooltip
                className='relative mt-4 flex flex-row gap-2 p-1'
                placement='top-start'
                isOpen={isReactionsTooltipOpen}
                onOpenChange={setIsReactionsTooltipOpen}
                content={reactions.map((reaction) => (
                  <Tooltip
                    key={reaction.type}
                    className='group relative'
                    content={reaction.label}
                    onOpenChange={(open) => {
                      if (open) {
                        setIsReactionsTooltipOpen(true);
                      }
                    }}
                  >
                    <Button
                      variant='light'
                      size='sm'
                      className='p-2 group'
                      isIconOnly
                      onPress={withAuth(() => handleReaction(reaction.type))}
                    >
                      <span className='text-xl group-hover:text-3xl transition-all duration-200'>
                        {reaction.icon}
                      </span>
                    </Button>
                  </Tooltip>
                ))}
              >
                <Button
                  variant={!selectedReaction ? "light" : "flat"}
                  color={!selectedReaction ? "default" : "primary"}
                  size='sm'
                  isIconOnly={!selectedReaction}
                  className={cn("group flex items-center gap-2", {
                    "text-gray-400": !selectedReaction,
                  })}
                >
                  {selectedReaction ? (
                    <span className='text-lg'>
                      {reactions.find((r) => r.type === selectedReaction)?.icon}
                    </span>
                  ) : (
                    <span className='text-lg'>
                      <StarIcon className='text-inherit' size={18} />
                    </span>
                  )}
                  {selectedReaction && (
                    <span className='text-sm capitalize'>{selectedReaction}</span>
                  )}
                </Button>
                {/* Legend: All reactions ordered + total counter */}
              </Tooltip>
              {/* Comment Button */}
              <Tooltip content='Comment'>
                <Button
                  variant='light'
                  size='sm'
                  className='flex flex-row gap-2 text-gray-400'
                  onPress={withAuth(() => togglePostModal(true, "reply"))}
                  aria-label='Comment'
                  tabIndex={0}
                >
                  <MessageSquareIcon className='text-inherit' size={18} />
                  {Boolean(post?.reply_count) && (
                    <span className='text-sm'>{post?.reply_count}</span>
                  )}
                </Button>
              </Tooltip>
              {/* Other Buttons (Repost, Backup, More) */}
              <Tooltip content='Repost'>
                <Button
                  variant='light'
                  size='sm'
                  className='text-gray-400'
                  onPress={withAuth(() => togglePostModal(true, "clone"))}
                  aria-label='Repost'
                  tabIndex={0}
                >
                  <Repeat2Icon className='text-inherit' size={22} strokeWidth={1.5} />
                </Button>
              </Tooltip>
              <Tooltip content='Share'>
                <Dropdown placement='bottom-end'>
                  <DropdownTrigger>
                    <Button
                      variant='light'
                      size='sm'
                      className='text-gray-400 max-w-32'
                      aria-label='Share'
                      tabIndex={0}
                    >
                      <Share2Icon className='text-inherit' size={18} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownSection showDivider>
                      <DropdownItem
                        key='x'
                        startContent={<SiX className='text-inherit' size={16} />}
                        as={Link}
                        href={getXPostPreview(post)}
                        target='_blank'
                      >
                        Share on X
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownItem
                      key='copy'
                      startContent={<CopyIcon className='text-inherit' size={16} />}
                      onPress={() => copyUrl(post)}
                    >
                      Copy link
                    </DropdownItem>
                    <DropdownItem
                      key='native'
                      startContent={<Share2Icon className='text-inherit' size={16} />}
                      onPress={() => shareUrl(post)}
                    >
                      Share via ...
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </Tooltip>
            </div>
          </>
        )}
      </CardFooter>
    </>
  );
}

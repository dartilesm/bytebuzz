"use client";

import { useToggleReactionMutation } from "@/hooks/mutation/use-toggle-reaction-mutation";
import { usePostContext } from "@/hooks/use-post-context";
import { Button, CardFooter, Divider, Tooltip, cn } from "@heroui/react";
import { ArchiveIcon, EllipsisIcon, MessageSquareIcon, Repeat2Icon, StarIcon } from "lucide-react";
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

export function PostFooter() {
  const { isThreadPagePost, togglePostModal, post, isNavigationDisabled } = usePostContext();
  const [selectedReaction, setSelectedReaction] = useState<Reaction["type"] | null>(
    post.reaction?.reaction_type ?? null,
  );
  const [isReactionsTooltipOpen, setIsReactionsTooltipOpen] = useState(false);

  const toggleReactionMutation = useToggleReactionMutation();

  /**
   * Handles toggling a reaction on a post
   * @param reaction - The type of reaction to toggle
   */
  function handleReaction(reaction: Reaction["type"]) {
    setIsReactionsTooltipOpen(false);
    if (!post?.id) return;

    setSelectedReaction((prev) => (prev === reaction ? null : reaction));
    toggleReactionMutation.mutate({
      post_id: post.id,
      reaction_type: reaction,
    });
  }

  // Use utility functions for reactions logic
  const reactionsWithCounts = getReactionsWithCounts(
    post,
    reactions,
    post.reaction?.reaction_type ?? null,
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
                          "z-[4]": reactionIndex === 0,
                          "z-[3]": reactionIndex === 1,
                          "z-[2]": reactionIndex === 2,
                          "z-[1]": reactionIndex === 3,
                        },
                      )}
                      aria-label={reaction.label}
                    >
                      <span aria-hidden="true">{reaction.icon}</span>
                    </span>
                  ))}
                </div>
                {totalReactions > 0 && (
                  <span className="text-gray-400 text-xs" aria-label="Total reactions">
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
                className="relative mt-4 flex flex-row gap-2 p-1"
                placement="top-start"
                isOpen={isReactionsTooltipOpen}
                onOpenChange={setIsReactionsTooltipOpen}
                content={reactions.map((reaction) => (
                  <Tooltip
                    key={reaction.type}
                    className="group relative"
                    content={reaction.label}
                    onOpenChange={(open) => {
                      if (open) {
                        setIsReactionsTooltipOpen(true);
                      }
                    }}
                  >
                    <Button
                      variant="light"
                      size="sm"
                      className="p-2 group"
                      isIconOnly
                      onPress={() => handleReaction(reaction.type)}
                    >
                      <span className="text-xl group-hover:text-3xl transition-all duration-200">
                        {reaction.icon}
                      </span>
                    </Button>
                  </Tooltip>
                ))}
              >
                <Button
                  variant={!selectedReaction ? "light" : "flat"}
                  color={!selectedReaction ? "default" : "primary"}
                  size="sm"
                  isIconOnly={!selectedReaction}
                  className={cn("group flex items-center gap-2", {
                    "text-gray-400": !selectedReaction,
                  })}
                >
                  {selectedReaction ? (
                    <span className="text-lg">
                      {reactions.find((r) => r.type === selectedReaction)?.icon}
                    </span>
                  ) : (
                    <span className="text-lg">
                      <StarIcon className="text-inherit" size={18} />
                    </span>
                  )}
                  {selectedReaction && (
                    <span className="text-sm capitalize">{selectedReaction}</span>
                  )}
                </Button>
                {/* Legend: All reactions ordered + total counter */}
              </Tooltip>
              {/* Comment Button */}
              <Tooltip content="Comment">
                <Button
                  variant="light"
                  size="sm"
                  className="flex flex-row gap-2 text-gray-400"
                  onPress={() => togglePostModal(true, "reply")}
                  aria-label="Comment"
                  tabIndex={0}
                >
                  <MessageSquareIcon className="text-inherit" size={18} />
                  {Boolean(post?.reply_count) && (
                    <span className="text-sm">{post?.reply_count}</span>
                  )}
                </Button>
              </Tooltip>
              {/* Other Buttons (Repost, Backup, More) */}
              <Tooltip content="Repost">
                <Button
                  variant="light"
                  size="sm"
                  className="text-gray-400"
                  onPress={() => togglePostModal(true, "clone")}
                  aria-label="Repost"
                  tabIndex={0}
                >
                  <Repeat2Icon className="text-inherit" size={22} strokeWidth={1.5} />
                </Button>
              </Tooltip>
              <Tooltip content="Backup (coming soon)">
                <Button
                  variant="light"
                  size="sm"
                  className="text-gray-400"
                  aria-label="Backup (coming soon)"
                  tabIndex={0}
                >
                  <ArchiveIcon className="text-inherit" size={18} />
                </Button>
              </Tooltip>
              <Tooltip content="More (coming soon)">
                <Button
                  variant="light"
                  size="sm"
                  className="text-gray-400"
                  aria-label="More (coming soon)"
                  tabIndex={0}
                  isIconOnly
                >
                  <EllipsisIcon className="text-inherit" size={18} />
                </Button>
              </Tooltip>
            </div>
          </>
        )}
      </CardFooter>
    </>
  );
}

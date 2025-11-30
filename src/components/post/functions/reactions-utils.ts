import type { Tables } from "database.types";
import type { NestedPost } from "@/types/nested-posts";

export interface Reaction {
  type: Tables<"reactions">["reaction_type"];
  icon: string;
  label: string;
}

export interface ReactionWithCount extends Reaction {
  count: number;
}

/**
 * Gets the count for a given reaction type from the post object
 * @param post - The post object
 * @param type - The reaction type
 * @returns The count for the reaction
 */
export function getReactionCount(post: NestedPost, type: Reaction["type"]): number {
  switch (type) {
    case "star":
      return post?.star_count ?? 0;
    case "coffee":
      return post?.coffee_count ?? 0;
    case "approve":
      return post?.approve_count ?? 0;
    case "cache":
      return post?.cache_count ?? 0;
    default:
      return 0;
  }
}

/**
 * Returns an array of reactions with their counts, subtracting 1 from the user's own reaction for the legend
 * @param post - The post object
 * @param reactions - The array of reaction definitions
 * @param selectedReaction - The user's current reaction type
 */
export function getReactionsWithCounts(
  post: NestedPost,
  reactions: Reaction[],
  selectedReaction: Reaction["type"] | null,
): ReactionWithCount[] {
  return reactions.map((reaction) => {
    let count = getReactionCount(post, reaction.type);
    if (selectedReaction === reaction.type && count > 0) {
      count -= 1;
    }
    return { ...reaction, count };
  });
}

/**
 * Sorts reactions by count descending and filters out zero-count reactions
 * @param reactionsWithCounts - Array of reactions with counts
 */
export function getSortedReactions(reactionsWithCounts: ReactionWithCount[]): ReactionWithCount[] {
  return [...reactionsWithCounts]
    .sort((a, b) => b.count - a.count)
    .filter((reaction) => reaction.count > 0);
}

/**
 * Sums the total count of all reactions
 * @param sortedReactions - Array of sorted reactions with counts
 */
export function getTotalReactions(sortedReactions: ReactionWithCount[]): number {
  return sortedReactions.reduce((sum, r) => sum + r.count, 0);
}

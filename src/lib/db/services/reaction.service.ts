import { createServerSupabaseClient } from "@/db/supabase";
import { createServiceWithContext } from "@/lib/create-service-with-context";
import { ServiceContext } from "@/types/services";
import type { Tables } from "database.types";

/**
 * Toggle a reaction on a post
 * @param postId - ID of the post to react to
 * @param reactionType - Type of reaction (like, love, etc.)
 */
async function toggleReaction(
  this: ServiceContext,
  postId: string,
  reactionType: Tables<"reactions">["reaction_type"]
) {
  const supabase = createServerSupabaseClient(this?.accessToken);
  return await supabase
    .rpc("toggle_reaction", {
      input_post_id: postId,
      input_reaction_type: reactionType,
    })
    .select()
    .single();
}

/**
 * Reaction service for all reaction-related operations
 *
 * @example
 * ```typescript
 * import { reactionService } from "@/lib/db/services/reaction.service";
 *
 * const result = await reactionService.toggleReaction(postId, "like");
 * ```
 */
export const reactionService = createServiceWithContext({
  toggleReaction,
});

export type ReactionService = typeof reactionService;

import { createServerSupabaseClient } from "@/db/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Tables } from "database.types";

/**
 * Toggle a reaction on a post
 * @param postId - ID of the post to react to
 * @param reactionType - Type of reaction (like, love, etc.)
 */
async function toggleReaction(
  postId: string,
  reactionType: Tables<"reactions">["reaction_type"]
): Promise<PostgrestSingleResponse<Tables<"reactions">>> {
  const supabase = createServerSupabaseClient();
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
export const reactionService = {
  toggleReaction,
};

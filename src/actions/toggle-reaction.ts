"use server";

import { reactionService } from "@/lib/db/services/reaction.service";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Tables } from "database.types";

export interface ToggleReactionData {
  post_id: string;
  reaction_type: Tables<"reactions">["reaction_type"];
}

export async function toggleReaction({
  post_id,
  reaction_type,
}: ToggleReactionData): Promise<PostgrestSingleResponse<Tables<"reactions">>> {
  return await reactionService.toggleReaction(post_id, reaction_type);
}

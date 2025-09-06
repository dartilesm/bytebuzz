"use server";

import { createServerSupabaseClient } from "@/db/supabase";
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
  const supabaseClient = createServerSupabaseClient();

  const toggleReaction = await supabaseClient
    .rpc("toggle_reaction", {
      input_post_id: post_id,
      input_reaction_type: reaction_type,
    })
    .select()
    .single();

  return toggleReaction;
}

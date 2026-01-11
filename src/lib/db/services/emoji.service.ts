// import type { EmojiData } from "@/components/ui/emoji-picker/types";
// import { createServerSupabaseClient } from "@/db/supabase";
import { createServiceWithContext } from "@/lib/create-service-with-context";
import type { ServiceContext } from "@/types/services";


/**
 * Get a single custom emoji by its composite ID (username:id)
 * @param fullId - The composite ID (e.g. "devhub:party_parrot")
 */
async function getCustomEmoji(this: ServiceContext, fullId: string) {
  // const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
  // const [creator, id] = fullId.split(":");

  // Example Supabase fetch:
  /*
  const { data, error } = await supabase
    .from("custom_emojis")
    .select("*")
    .eq("creator_username", creator)
    .eq("slug", id)
    .single();
    
  if (error) return null;
  return data;
  */

  return null;
}

/**
 * Get all available custom emojis (e.g. for the picker)
 */
async function getAllCustomEmojis(this: ServiceContext) {
  // const supabase = createServerSupabaseClient({ accessToken: this.accessToken });

  // Example Supabase fetch:
  /*
  const { data, error } = await supabase
    .from("custom_emoji_categories")
    .select("*, emojis:custom_emojis(*)");
    
  return data;
  */

  return null;
}

export const emojiService = createServiceWithContext({
  getCustomEmoji,
  getAllCustomEmojis,
});

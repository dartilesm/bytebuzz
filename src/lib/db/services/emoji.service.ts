// import type { EmojiData } from "@/components/ui/emoji-picker/types";
// import { createServerSupabaseClient } from "@/db/supabase";
import { createServiceWithContext } from "@/lib/create-service-with-context";
import type { ServiceContext } from "@/types/services";

// Mock data to replace DB for now
const MOCK_EMOJIS = [
  {
    id: "my-custom-category",
    name: "My Custom Pack",
    emojis: [
      {
        id: "party_parrot",
        name: "Party Parrot",
        shortcodes: ":party_parrot:",
        keywords: ["blob", "party", "dance"],
        src: "https://i.redd.it/uvzeqpqgwk2c1.gif",
        creator: "devhub",
      },
    ],
  },
];

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

  // Mock implementation
  const [creator, emojiId] = fullId.split(":");
  if (!creator || !emojiId) return null;

  for (const category of MOCK_EMOJIS) {
    const emoji = category.emojis.find((e) => e.id === emojiId && e.creator === creator);
    if (emoji) return emoji;
  }

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

  return MOCK_EMOJIS;
}

export const emojiService = createServiceWithContext({
  getCustomEmoji,
  getAllCustomEmojis,
});

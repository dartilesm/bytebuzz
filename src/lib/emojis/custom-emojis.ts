import type { CustomEmoji, EmojiData } from "@/components/ui/emoji-picker-2/types";

export const CUSTOM_EMOJIS: CustomEmoji[] = [
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
      },
    ],
  },
];

/**
 * Resolves a custom emoji ID to its URL.
 * Returns undefined if not found.
 */
export function resolveCustomEmojiUrl(id: string): string | undefined {
  // Flatten emojis for search
  for (const category of CUSTOM_EMOJIS) {
    const emoji = category.emojis.find((e) => e.id === id);
    if (emoji) return emoji.src;
  }
  return undefined;
}

/**
 * Gets a custom emoji by its ID.
 */
export function getCustomEmojiById(id: string): EmojiData | undefined {
  for (const category of CUSTOM_EMOJIS) {
    const emoji = category.emojis.find((e) => e.id === id);
    if (emoji) return emoji;
  }
  return undefined;
}

import type { CustomEmoji, EmojiData } from "@/components/ui/emoji-picker-2/types";

export const CUSTOM_EMOJIS: CustomEmoji[] = [
  {
    id: "my-custom-category",
    name: "My Custom Pack",
    emojis: [
      {
        id: "party_parrot2",
        name: "Party Parrot as das das dsad asd sa s",
        shortcodes: ":devhub/party_parrot2:",
        keywords: ["blob", "party", "dance"],
        src: "https://i.redd.it/uvzeqpqgwk2c1.gif",
        creator: "devhub",
      },
    ],
  },
];

/**
 * Resolves a custom emoji ID (username:emojiId) to its API path.
 * Returns undefined if not found.
 */
export function resolveCustomEmojiUrl(fullId: string): string | undefined {
  const realUrl = getRealCustomEmojiUrl(fullId);
  if (realUrl) {
    return `/api/emoji/${fullId}`;
  }
  return undefined;
}

/**
 * Gets the actual source URL for a given custom emoji ID (username:emojiId).
 */
export function getRealCustomEmojiUrl(fullId: string): string | undefined {
  const [creator, emojiId] = fullId.split(":");
  if (!creator || !emojiId) return undefined;

  for (const category of CUSTOM_EMOJIS) {
    const emoji = category.emojis.find((e) => e.id === emojiId && e.creator === creator);
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

import type { EmojiData } from "@/components/ui/emoji-picker-2/types";

/**
 * Extracts emoji data with correct skin tone variant
 * @param emoji The emoji object
 * @param options configuration options
 * @param options.skinIndex the index of the skin to use
 * @returns The specific skin variant data
 */
export function getEmojiData(
  emoji: EmojiData,
  { skinIndex = 0 }: { skinIndex?: number } = {},
): EmojiData {
  if (!emoji.skins || emoji.skins.length === 0) {
    return emoji;
  }

  const skin =
    emoji.skins[skinIndex] ||
    (() => {
      skinIndex = 0;
      return emoji.skins[skinIndex];
    })();

  if (!skin) return emoji;

  const emojiData: EmojiData = {
    ...emoji,
    native: skin.native,
    unified: skin.unified,
    shortcodes: skin.shortcodes || emoji.shortcodes,
  };

  if (emoji.skins.length > 1) {
    emojiData.skin = skinIndex + 1;
  }

  if (skin.src) {
    emojiData.src = skin.src;
  }

  return emojiData;
}

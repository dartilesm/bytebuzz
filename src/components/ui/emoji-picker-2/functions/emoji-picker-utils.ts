import {
  Activity,
  AlertCircle,
  Clock,
  Flag,
  Lightbulb,
  type LucideIcon,
  Plane,
  Smile,
  Star,
  Trees,
  Utensils,
} from "lucide-react";
import { EmojiCategory } from "@/components/ui/emoji-picker-2/constants";
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

/**
 * Gets the icon component for a category
 * @param categoryId The category ID
 * @returns LucideIcon component
 */
export function getCategoryIcon(categoryId: string): LucideIcon {
  switch (categoryId) {
    case EmojiCategory.FREQUENT:
      return Clock;
    case EmojiCategory.PEOPLE:
      return Smile;
    case EmojiCategory.NATURE:
      return Trees;
    case EmojiCategory.FOODS:
      return Utensils;
    case EmojiCategory.ACTIVITY:
      return Activity;
    case EmojiCategory.PLACES:
      return Plane;
    case EmojiCategory.OBJECTS:
      return Lightbulb;
    case EmojiCategory.SYMBOLS:
      return Star;
    case EmojiCategory.FLAGS:
      return Flag;
    default:
      return AlertCircle;
  }
}

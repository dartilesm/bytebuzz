import {
  Activity,
  AlertCircle,
  Clock,
  Flag,
  Lightbulb,
  Plane,
  Smile,
  Star,
  Trees,
  Utensils,
} from "lucide-react";

export function getEmojiData(emoji: any, { skinIndex = 0 } = {}) {
  const skin =
    emoji.skins[skinIndex] ||
    (() => {
      skinIndex = 0;
      return emoji.skins[skinIndex];
    })();

  const emojiData: any = {
    id: emoji.id,
    name: emoji.name,
    native: skin.native,
    unified: skin.unified,
    keywords: emoji.keywords,
    shortcodes: skin.shortcodes || emoji.shortcodes,
  };

  if (emoji.skins.length > 1) {
    emojiData.skin = skinIndex + 1;
  }

  if (skin.src) {
    emojiData.src = skin.src;
  }

  if (emoji.aliases && emoji.aliases.length) {
    emojiData.aliases = emoji.aliases;
  }

  if (emoji.emoticons && emoji.emoticons.length) {
    emojiData.emoticons = emoji.emoticons;
  }

  return emojiData;
}

export function getCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case "frequent":
      return Clock;
    case "people":
      return Smile;
    case "nature":
      return Trees;
    case "foods":
      return Utensils;
    case "activity":
      return Activity;
    case "places":
      return Plane;
    case "objects":
      return Lightbulb;
    case "symbols":
      return Star;
    case "flags":
      return Flag;
    default:
      return AlertCircle;
  }
}

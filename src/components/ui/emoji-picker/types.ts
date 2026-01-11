import type { EmojiCategory, EmojiSet, Locale } from "@/components/ui/emoji-picker/constants";

export interface EmojiData {
  id: string;
  name: string;
  native?: string;
  unified?: string;
  keywords: string[];
  shortcodes: string;
  skin?: number;
  src?: string;
  aliases?: string[];
  emoticons?: string[];
  creator?: string;
  skins?: { native: string; unified: string; shortcodes?: string; src?: string }[];
  search?: string;
  version?: number;
}

export interface CategoryData {
  id: EmojiCategory | string;
  emojis: string[];
  name?: string;
  icon?: React.ComponentType;
  target?: any;
}

export interface CustomEmoji {
  id: string;
  name: string;
  emojis: EmojiData[];
  icon?: any;
}

export interface EmojiDataMap {
  categories: CategoryData[];
  emojis: Record<string, EmojiData>;
  aliases: Record<string, string>;
  emoticons: Record<string, string>;
  natives: Record<string, string>;
  originalCategories?: CategoryData[];
}

export interface UseEmojiDataOptions {
  set?: EmojiSet;
  locale?: Locale;
  custom?: CustomEmoji[];
  emojiVersion?: number;
  noCountryFlags?: boolean;
  categories?: string[];
  categoryIcons?: Record<string, any>;
  exceptEmojis?: string[];
}

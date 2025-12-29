import { useMemo } from "react";
import { searchEmojis } from "@/components/ui/emoji-picker/helpers/search-index";
import type { EmojiDataMap } from "@/components/ui/emoji-picker/types";

/**
 * Hook to search emojis based on query string
 */
export function useEmojiSearch(query: string, data: EmojiDataMap | undefined) {
  return useMemo(() => {
    if (!data || !query) return null;
    return searchEmojis(query, data);
  }, [query, data]);
}

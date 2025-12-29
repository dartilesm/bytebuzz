import type { EmojiData, EmojiDataMap } from "@/components/ui/emoji-picker/types";

export const SHORTCODES_REGEX = /^(?:\:([^\:]+)\:)(?:\:skin-tone-(\d)\:)?$/;

/**
 * Searches emojis by query string with scoring algorithm
 * @param query The search query
 * @param emojiData The processed emoji data map
 * @param maxResults Maximum number of results to return
 */
export function searchEmojis(
  query: string,
  emojiData: EmojiDataMap,
  maxResults: number = 90,
): EmojiData[] {
  if (!query || !query.trim().length) return [];

  const values = query
    .toLowerCase()
    .replace(/(\w)-/, "$1 ")
    .split(/[\s|,]+/)
    .filter((word, i, words) => {
      return word.trim() && words.indexOf(word) === i;
    });

  if (!values.length) return [];

  const pool = Object.values(emojiData.emojis);

  let currentPool = pool;
  let results: EmojiData[] = [];
  let scores: Record<string, number> = {};

  for (const val of values) {
    if (!currentPool.length) break;

    results = [];
    scores = {};

    for (const emoji of currentPool) {
      if (!emoji.search) continue;
      const score = emoji.search.indexOf(`,${val}`);
      if (score === -1) continue;

      results.push(emoji);
      if (!scores[emoji.id]) {
        scores[emoji.id] = 0;
      }
      scores[emoji.id] += emoji.id === val ? 0 : score + 1;
    }

    currentPool = results;
  }

  if (results.length < 2) {
    return results;
  }

  results.sort((a, b) => {
    const aScore = scores[a.id];
    const bScore = scores[b.id];

    if (aScore === bScore) {
      return a.id.localeCompare(b.id);
    }

    return aScore - bScore;
  });

  if (results.length > maxResults) {
    results = results.slice(0, maxResults);
  }

  return results;
}

/**
 * Gets an emoji by ID, alias, or native string
 */
export function getEmoji(emojiId: string, data: EmojiDataMap): EmojiData | undefined {
  if (!emojiId || !data) return undefined;

  // If emojiId looks like an ID and exists
  if (data.emojis[emojiId]) return data.emojis[emojiId];

  // Check alias
  const aliasId = data.aliases[emojiId];
  if (aliasId && data.emojis[aliasId]) return data.emojis[aliasId];

  // Check native (if we have a native map)
  const nativeId = data.natives[emojiId];
  if (nativeId && data.emojis[nativeId]) return data.emojis[nativeId];

  // Check emoticons
  const emoticonId = data.emoticons[emojiId];
  if (emoticonId && data.emojis[emoticonId]) return data.emojis[emoticonId];

  return undefined;
}

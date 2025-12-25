import {
  DEFAULT_MAX_FREQUENT_ROWS,
  DEFAULT_PER_LINE,
} from "@/components/ui/emoji-picker-2/constants";

/**
 * Gets the list of frequent emoji IDs sorted by usage
 */
export function getFrequentEmojis(
  frequentMap: Record<string, number>,
  perLine: number = DEFAULT_PER_LINE,
  maxRows: number = DEFAULT_MAX_FREQUENT_ROWS,
): string[] {
  const emojiIds = Object.keys(frequentMap);

  const sortedIds = emojiIds.sort((a, b) => {
    const countA = frequentMap[a] || 0;
    const countB = frequentMap[b] || 0;

    // Sort by count descending, then by ID ascending
    if (countA === countB) {
      return a.localeCompare(b);
    }
    return countB - countA;
  });

  const maxEmojis = maxRows * perLine;
  return sortedIds.slice(0, maxEmojis);
}

/**
 * Defaults for frequent emojis when history is empty
 */
export const DEFAULT_FREQUENT_EMOJIS = [
  "+1",
  "grinning",
  "kissing_heart",
  "heart_eyes",
  "laughing",
  "stuck_out_tongue_winking_eye",
  "sweat_smile",
  "joy",
  "scream",
  "disappointed",
  "unamused",
  "weary",
  "sob",
  "sunglasses",
  "heart",
];

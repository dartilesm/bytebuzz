// @ts-nocheck
import { Data, init } from "../config";

const SHORTCODES_REGEX = /^(?:\:([^\:]+)\:)(?:\:skin-tone-(\d)\:)?$/;
let Pool: any[] | null = null;

function get(emojiId: any) {
  if (emojiId.id) {
    return emojiId;
  }

  return (
    Data.emojis[emojiId] ||
    Data.emojis[Data.aliases[emojiId]] ||
    Data.emojis[Data.natives[emojiId]]
  );
}

function reset() {
  Pool = null;
}

async function search(value: string, { maxResults = 90, caller = "SearchIndex.search" } = {}) {
  if (!value || !value.trim().length) return null;

  await init(null, { caller });

  const values = value
    .toLowerCase()
    .replace(/(\w)-/, "$1 ")
    .split(/[\s|,]+/)
    .filter((word, i, words) => {
      return word.trim() && words.indexOf(word) === i;
    });

  if (!values.length) return;

  if (!Pool) {
    Pool = Object.values(Data.emojis);
  }
  
  let pool = Pool;
  let results: any[] = [];
  let scores: Record<string, number> = {};

  for (const val of values) {
    if (!pool.length) break;

    results = [];
    scores = {};

    for (const emoji of pool) {
      if (!emoji.search) continue;
      const score = emoji.search.indexOf(`,${val}`);
      if (score === -1) continue;

      results.push(emoji);
      if (!scores[emoji.id]) {
        scores[emoji.id] = 0;
      }
      scores[emoji.id] += emoji.id === val ? 0 : score + 1;
    }

    pool = results;
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

export default { search, get, reset, SHORTCODES_REGEX };

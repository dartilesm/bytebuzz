// @ts-nocheck
import { Store } from "../helpers";

const DEFAULTS = [
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

let Index: any | null = null;

function add(emoji: { id: string }) {
  if (!Index) {
    Index = Store.get("frequently") || {};
  }

  const emojiId = emoji.id || emoji;
  if (!emojiId) return;

  if (!Index[emojiId]) {
    Index[emojiId] = 0;
  }
  Index[emojiId] += 1;

  Store.set("last", emojiId);
  Store.set("frequently", Index);
}

function get({ maxFrequentRows, perLine }: { maxFrequentRows: number; perLine: number }) {
  if (!maxFrequentRows) return [];

  if (!Index) {
    Index = Store.get("frequently");
  }
  
  let emojiIds: string[] = [];

  if (!Index) {
    Index = {};

    for (let i = 0; i < DEFAULTS.slice(0, perLine).length; i++) {
      const emojiId = DEFAULTS[i];
      Index[emojiId] = perLine - i;
      emojiIds.push(emojiId);
    }

    return emojiIds;
  }

  const max = maxFrequentRows * perLine;
  const last = Store.get("last");

  for (const emojiId in Index) {
    emojiIds.push(emojiId);
  }

  emojiIds.sort((a, b) => {
    const aScore = Index[b];
    const bScore = Index[a];

    if (aScore === bScore) {
      return a.localeCompare(b);
    }

    return aScore - bScore;
  });

  if (emojiIds.length > max) {
    const removedIds = emojiIds.slice(max);
    emojiIds = emojiIds.slice(0, max);

    for (const removedId of removedIds) {
      if (removedId === last) continue;
      delete Index[removedId];
    }

    if (last && emojiIds.indexOf(last) === -1) {
      delete Index[emojiIds[emojiIds.length - 1]];
      emojiIds.splice(-1, 1, last);
    }

    Store.set("frequently", Index);
  }

  return emojiIds;
}

export default { add, get, DEFAULTS };

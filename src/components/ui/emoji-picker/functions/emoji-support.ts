const CACHE = new Map<string, boolean>();
const VERSIONS = [
  { v: 15, emoji: "🫨" },
  { v: 14, emoji: "🫠" },
  { v: 13.1, emoji: "😶‍🌫️" },
  { v: 13, emoji: "🥸" },
  { v: 12.1, emoji: "🧑‍🦰" },
  { v: 12, emoji: "🥱" },
  { v: 11, emoji: "🥰" },
  { v: 5, emoji: "🤩" },
  { v: 4, emoji: "👱‍♀️" },
  { v: 3, emoji: "🤣" },
  { v: 2, emoji: "👋🏻" },
  { v: 1, emoji: "🙃" },
];

/**
 * Detects the latest emoji version supported by the browser
 */
function latestVersion(): number | undefined {
  for (const { v, emoji } of VERSIONS) {
    if (isSupported(emoji)) {
      return v;
    }
  }
}

/**
 * Checks if country flag emojis are supported
 * (Windows often doesn't support them)
 */
function noCountryFlags(): boolean {
  if (isSupported("🇨🇦")) {
    return false;
  }

  return true;
}

/**
 * Checks if a specific emoji is supported by the browser
 */
function isSupported(emoji: string): boolean {
  if (CACHE.has(emoji)) {
    return CACHE.get(emoji) as boolean;
  }

  const supported = isEmojiSupported(emoji);
  CACHE.set(emoji, supported);

  return supported;
}

// https://github.com/koala-interactive/is-emoji-supported
function isEmojiSupported(unicode: string): boolean {
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    if (!navigator.userAgent.includes("jsdom")) {
      const canvas = document.createElement("canvas");
      // @ts-ignore
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    }
  } catch {
    // Ignore error
  }

  // Not in browser env
  if (!ctx) {
    return false;
  }

  const CANVAS_HEIGHT = 25;
  const CANVAS_WIDTH = 20;
  const textSize = Math.floor(CANVAS_HEIGHT / 2);

  // Initialize convas context
  ctx.font = `${textSize}px Arial, Sans-Serif`;
  ctx.textBaseline = "top";
  ctx.canvas.width = CANVAS_WIDTH * 2;
  ctx.canvas.height = CANVAS_HEIGHT;

  ctx.clearRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT);

  // Draw in red on the left
  ctx.fillStyle = "#FF0000";
  ctx.fillText(unicode, 0, 22);

  // Draw in blue on right
  ctx.fillStyle = "#0000FF";
  ctx.fillText(unicode, CANVAS_WIDTH, 22);

  const a = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
  const count = a.length;
  let i = 0;

  // Search the first visible pixel
  for (; i < count && !a[i + 3]; i += 4);

  // No visible pixel
  if (i >= count) {
    return false;
  }

  // Emoji has immutable color, so we check the color of the emoji in two different colors
  // the result show be the same.
  const x = CANVAS_WIDTH + ((i / 4) % CANVAS_WIDTH);
  const y = Math.floor(i / 4 / CANVAS_WIDTH);
  const b = ctx.getImageData(x, y, 1, 1).data;

  if (a[i] !== b[0] || a[i + 2] !== b[2]) {
    return false;
  }

  return true;
}

export const emojiSupport = {
  latestVersion,
  noCountryFlags,
  isSupported,
};

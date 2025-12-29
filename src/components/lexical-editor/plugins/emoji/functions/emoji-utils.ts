import { $getSelection, $isRangeSelection, type TextNode } from "lexical";

/**
 * Regex to match an emoji trigger pattern.
 * Matches a colon ":" followed by alphanumeric characters/underscores,
 * allowing it to be at the start of the string or preceded by whitespace.
 */
export const EMOJI_TRIGGER_REGEX = /(?:^|\s):([a-z0-9_]*)$/i;

/**
 * Gets the current caret position coordinates relative to the viewport.
 *
 * @returns Object with top and left coordinates, or null if no selection.
 */
export function getCaretPosition(): { top: number; left: number } | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    top: rect.bottom + 4,
    left: rect.left,
  };
}

/**
 * Checks for an emoji trigger pattern in the current selection.
 *
 * @returns Object containing the match and query if found, or null.
 */
export function checkEmojiTrigger(): { query: string; match: RegExpMatchArray } | null {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) return null;

  const anchor = selection.anchor;
  const node = anchor.getNode();

  if (!node || !("getTextContent" in node)) return null;

  const textNode = node as TextNode;
  const text = textNode.getTextContent();
  const offset = anchor.offset;
  const beforeCursor = text.slice(0, offset);

  const match = beforeCursor.match(EMOJI_TRIGGER_REGEX);

  if (!match) return null;

  return {
    query: match[1].toLowerCase(),
    match,
  };
}

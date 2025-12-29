"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, type TextNode } from "lexical";
import { useEffect, useState } from "react";
import { useEventListener } from "usehooks-ts";
import { insertEmoji } from "@/components/lexical-editor/functions/insert-emoji";
import { EmojiSuggestions } from "@/components/lexical-editor/plugins/emoji/emoji-suggestions";
import {
  checkEmojiTrigger,
  getCaretPosition,
} from "@/components/lexical-editor/plugins/emoji/functions/emoji-utils";
import type { EmojiData } from "@/components/ui/emoji-picker-2/types";

interface EmojiState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number } | null;
}

/**
 * Plugin that handles emoji autocomplete functionality in Lexical editor
 *
 * Triggers when user types ":" preceded by a space or at the start of a line.
 */
export function EmojiPlugin() {
  const [editor] = useLexicalComposerContext();
  const [emojiState, setEmojiState] = useState<EmojiState>({
    isOpen: false,
    query: "",
    position: null,
  });

  function closeEmojis() {
    setEmojiState({
      isOpen: false,
      query: "",
      position: null,
    });
  }

  function selectEmoji(emojiData: EmojiData) {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchor = selection.anchor;
      const node = anchor.getNode();

      if (!node || !("getTextContent" in node)) return;

      const textNode = node as TextNode;
      const currentText = textNode.getTextContent();
      const currentOffset = anchor.offset;

      const beforeCursor = currentText.slice(0, currentOffset);
      // Using the same regex logic from utils, but need to re-match here to get precise indices for replacement.
      // We can't reuse the match object from state easily because logic is imperative here inside update.
      const emojiMatch = beforeCursor.match(/(?:^|\s):([a-z0-9_]*)$/i);

      if (!emojiMatch) return;

      const matchString = emojiMatch[0];
      const matchStart = currentOffset - matchString.length;
      const colonIndex = matchString.startsWith(" ") ? matchStart + 1 : matchStart;

      // Select from colon to current offset
      textNode.select(colonIndex, currentOffset);

      // Insert emoji character (text or image)
      insertEmoji(selection, emojiData);

      // Add a space after
      selection.insertText(" ");
    });

    closeEmojis();
  }

  function detectEmojiTrigger() {
    editor.getEditorState().read(() => {
      const trigger = checkEmojiTrigger();
      const position = getCaretPosition();

      if (trigger && position)
        return setEmojiState({
          isOpen: true,
          query: trigger.query,
          position,
        });

      if (emojiState.isOpen) closeEmojis();
    });
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!emojiState.isOpen) return;

    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      closeEmojis();
    }
  }

  useEventListener("keydown", handleKeyDown);

  useEffect(() => {
    return mergeRegister(editor.registerTextContentListener(detectEmojiTrigger));
  }, [editor, detectEmojiTrigger]);

  if (!emojiState.isOpen || !emojiState.position) return null;

  return (
    <EmojiSuggestions
      query={emojiState.query}
      position={emojiState.position}
      onSelect={selectEmoji}
      onClose={closeEmojis}
    />
  );
}

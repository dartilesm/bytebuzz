"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, type TextNode } from "lexical";
import { useCallback, useEffect, useState } from "react";
import { EmojiSuggestions } from "@/components/lexical-editor/plugins/emoji/emoji-suggestions";

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

  const closeEmojis = useCallback(() => {
    setEmojiState({
      isOpen: false,
      query: "",
      position: null,
    });
  }, []);

  const selectEmoji = useCallback(
    (emoji: { emoji: string }) => {
      console.log("Selected emoji:", emoji);
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchor = selection.anchor;
        const node = anchor.getNode();

        if (node && "getTextContent" in node) {
          const textNode = node as TextNode;
          const currentText = textNode.getTextContent();
          const currentOffset = anchor.offset;

          const beforeCursor = currentText.slice(0, currentOffset);
          // Match ":" preceded by space or start of line
          const emojiMatch = beforeCursor.match(/(?:^|\s):([a-z0-9_]*)$/i);

          if (emojiMatch) {
            const matchString = emojiMatch[0];
            // We want to replace from the start of the match (including space if it was matched)
            const matchStart = currentOffset - matchString.length;
            const colonIndex = matchString.startsWith(" ") ? matchStart + 1 : matchStart;

            // Select from colon to current offset
            textNode.select(colonIndex, currentOffset);

            // Insert emoji character
            selection.insertText(emoji.emoji);

            // Add a space after
            selection.insertText(" ");
          }
        }
      });

      closeEmojis();
    },
    [editor, closeEmojis],
  );

  const getCaretPosition = useCallback((): { top: number; left: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    return {
      top: rect.bottom + 4,
      left: rect.left,
    };
  }, []);

  const detectEmojiTrigger = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchor = selection.anchor;
      const node = anchor.getNode();

      if (node && "getTextContent" in node) {
        const textNode = node as TextNode;
        const text = textNode.getTextContent();
        const offset = anchor.offset;

        const beforeCursor = text.slice(0, offset);
        // Regex to check for ":" preceded by space or start of line
        const emojiMatch = beforeCursor.match(/(?:^|\s):([a-z0-9_]*)$/i);

        if (emojiMatch) {
          const query = emojiMatch[1].toLowerCase();
          const position = getCaretPosition();

          if (position) {
            setEmojiState((prev) => ({
              ...prev,
              isOpen: true,
              query,
              position,
            }));
          }
        } else if (emojiState.isOpen) {
          closeEmojis();
        }
      }
    });
  }, [editor, emojiState.isOpen, closeEmojis, getCaretPosition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!emojiState.isOpen) return;

      // When the emoji dropdown is open, we close on Escape/Tab
      if (event.key === "Escape" || event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        closeEmojis();
      }
    };

    if (emojiState.isOpen) {
      document.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [emojiState.isOpen, closeEmojis]);

  useEffect(() => {
    return mergeRegister(editor.registerTextContentListener(detectEmojiTrigger));
  }, [editor, detectEmojiTrigger]);

  return (
    <>
      {emojiState.isOpen && emojiState.position && (
        <EmojiSuggestions
          query={emojiState.query}
          position={emojiState.position}
          onSelect={selectEmoji}
          onClose={closeEmojis}
        />
      )}
    </>
  );
}

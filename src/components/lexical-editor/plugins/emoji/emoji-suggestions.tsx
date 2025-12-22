"use client";

import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { EmojiSuggestionList } from "@/components/ui/emoji-suggestion-list";

interface EmojiSuggestionsProps {
  /**
   * The search term to filter emojis
   */
  query: string;
  /**
   * Position to display the dropdown
   */
  position: { top: number; left: number };
  /**
   * Callback when an emoji is selected
   */
  onSelect: (emoji: { emoji: string; label: string }) => void;
  /**
   * Callback when the dropdown should be closed
   */
  onClose: () => void;
}

/**
 * Dropdown component showing emoji suggestions
 */
export function EmojiSuggestions({ query, position, onSelect }: EmojiSuggestionsProps) {
  return createPortal(
    <Card
      className="fixed z-50 w-64 max-h-80 overflow-hidden shadow-lg border border-border py-0"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <EmojiSuggestionList
        searchTerm={query}
        onEmojiSelect={onSelect}
        className="border-none rounded-none scrollbar-auto"
      />
    </Card>,
    document.body,
  );
}

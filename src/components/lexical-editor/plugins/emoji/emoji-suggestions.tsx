"use client";

import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { useRef } from "react";
import { useEventListener } from "usehooks-ts";
import { handleEmojiNavigation } from "@/components/lexical-editor/plugins/emoji/functions/emoji-navigation";
import { Card } from "@/components/ui/card";
import { EmojiPickerList } from "@/components/ui/emoji-picker-2/emoji-picker-list";
import type { EmojiData } from "@/components/ui/emoji-picker-2/types";

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
  onSelect: (emoji: EmojiData) => void;
  /**
   * Callback when the dropdown should be closed
   */
  onClose: () => void;
}

/**
 * Dropdown component showing emoji suggestions
 */
export function EmojiSuggestions({ query, position, onSelect }: EmojiSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEventListener("keydown", handleKeyDown);

  /**
   * Handles keyboard navigation events for the emoji list.
   * Delegates the actual navigation logic to the utility function.
   *
   * @param event - The keyboard event
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (!containerRef.current) return;

    // Use a selector that targets the buttons rendered by EmojiPickerList
    // Based on EmojiPickerList implementation, they are buttons.
    handleEmojiNavigation(event, containerRef.current, "button");
  }

  return (
    <Popover defaultOpen>
      <PopoverContent
        className="fixed z-50 w-64 max-h-80 overflow-hidden shadow-lg border border-border py-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        asChild
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <Card>
          <div ref={containerRef} className="h-full">
            <EmojiPickerList
              searchTerm={query}
              onEmojiSelect={onSelect}
              className="border-none rounded-none scrollbar-auto"
            />
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

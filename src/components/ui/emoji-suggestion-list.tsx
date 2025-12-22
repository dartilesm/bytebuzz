"use client";

import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from "frimousse";
import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmojiSuggestionListProps {
  /**
   * The search term to filter emojis
   */
  searchTerm: string;
  /**
   * Callback invoked when an emoji is selected
   */
  onEmojiSelect?: (emoji: { emoji: string; label: string }) => void;
  /**
   * Additional className for the root element
   */
  className?: string;
}

/**
 * Vertical emoji suggestion list component using Frimousse
 *
 * Displays emojis in a vertical list format with emoji + label.
 * Supports keyboard navigation and controlled search filtering.
 */
export function EmojiSuggestionList({
  searchTerm,
  onEmojiSelect,
  className,
}: EmojiSuggestionListProps) {
  return (
    <EmojiPickerPrimitive.Root
      className={cn(
        "bg-popover text-popover-foreground isolate flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      columns={1}
      onEmojiSelect={onEmojiSelect}
      data-slot="emoji-suggestion-list"
    >
      {/* Hidden controlled search input */}
      <EmojiPickerPrimitive.Search
        value={searchTerm}
        readOnly
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <EmojiPickerPrimitive.Viewport
        className="relative flex-1 outline-hidden"
        data-slot="emoji-suggestion-list-viewport"
      >
        <EmojiPickerPrimitive.Loading
          className="absolute inset-0 flex items-center justify-center text-muted-foreground"
          data-slot="emoji-suggestion-list-loading"
        >
          <LoaderIcon className="size-4 animate-spin" />
        </EmojiPickerPrimitive.Loading>
        <EmojiPickerPrimitive.Empty
          className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
          data-slot="emoji-suggestion-list-empty"
        >
          No emoji found.
        </EmojiPickerPrimitive.Empty>
        <EmojiPickerPrimitive.List
          className="select-none pb-1"
          components={{
            Row: EmojiSuggestionRow,
            Emoji: EmojiSuggestionItem,
            CategoryHeader: EmojiSuggestionCategoryHeader,
          }}
          data-slot="emoji-suggestion-list-items"
        />
      </EmojiPickerPrimitive.Viewport>
    </EmojiPickerPrimitive.Root>
  );
}

/**
 * Row component for emoji suggestions - renders as a single column vertical list
 */
function EmojiSuggestionRow({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div {...props} className="scroll-my-1 px-1" data-slot="emoji-suggestion-row">
      {children}
    </div>
  );
}

/**
 * Emoji item component - renders emoji + label horizontally
 */
function EmojiSuggestionItem({ emoji, className, ...props }: EmojiPickerListEmojiProps) {
  return (
    <button
      {...props}
      className={cn(
        "data-active:bg-accent hover:bg-accent/50 flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors",
        className,
      )}
      data-slot="emoji-suggestion-item"
    >
      <span className="flex size-7 shrink-0 items-center justify-center text-lg leading-none">
        {emoji.emoji}
      </span>
      <span className="text-popover-foreground flex-1 truncate text-sm font-medium">
        {emoji.label}
      </span>
    </button>
  );
}

/**
 * Category header component - hidden for suggestion list
 */
function EmojiSuggestionCategoryHeader({ ...props }: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className="sr-only"
      data-slot="emoji-suggestion-category-header"
      aria-hidden="true"
    />
  );
}

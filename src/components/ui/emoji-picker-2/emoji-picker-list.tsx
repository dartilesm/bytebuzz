import { Loader2 } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { EmojiSet, Locale, SkinTone, StorageKey } from "@/components/ui/emoji-picker-2/constants";
import { getEmojiData } from "@/components/ui/emoji-picker-2/functions/emoji-picker-utils";
import { useEmojiData } from "@/components/ui/emoji-picker-2/hooks/use-emoji-data";
import { useEmojiSearch } from "@/components/ui/emoji-picker-2/hooks/use-emoji-search";
import type { EmojiData, UseEmojiDataOptions } from "@/components/ui/emoji-picker-2/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface EmojiPickerListProps extends UseEmojiDataOptions {
  searchTerm: string;
  onEmojiSelect?: (emoji: EmojiData) => void;
  className?: string;
  skin?: number;
}

export function EmojiPickerList({
  searchTerm,
  onEmojiSelect,
  skin: initialSkin = SkinTone.DEFAULT,
  set = EmojiSet.NATIVE,
  locale = Locale.EN,
  custom,
  categories,
  categoryIcons,
  emojiVersion,
  noCountryFlags,
  exceptEmojis,
  className,
}: EmojiPickerListProps) {
  const [skin] = useLocalStorage<number>(StorageKey.SKIN_TONE, initialSkin);

  const { data: initializedData } = useEmojiData({
    set,
    locale,
    custom,
    categories,
    categoryIcons,
    emojiVersion,
    noCountryFlags,
    exceptEmojis,
  });

  const searchResults = useEmojiSearch(searchTerm, initializedData?.data);

  if (!initializedData) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  // If we have a search term, show results
  // If no search term, we might want to show nothing or frequent?
  // The use case is "autocomplete", so usually checks if searchTerm > 0.
  // But the prompt says "won't have search bar, instead will receive the search term".

  if (!searchResults || searchResults.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden bg-popover text-popover-foreground rounded-md",
          className,
        )}
      >
        <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-popover text-popover-foreground rounded-md shadow-md border",
        className,
      )}
    >
      <ScrollArea className="h-full [&>div]:max-h-[300px]">
        <div className="flex flex-col p-1 gap-2">
          {searchResults.map((emoji) => {
            const emojiData = getEmojiData(emoji, { skinIndex: skin - 1 });
            return (
              <Button
                variant="ghost"
                key={emoji.id}
                onClick={() => onEmojiSelect?.(emojiData)}
                className="flex items-center gap-3 text-left text-accent-foreground/80 hover:text-accent-foreground"
              >
                {emojiData.src && (
                  <img
                    src={emojiData.src}
                    alt={emojiData.name}
                    className="size-5 object-contain shrink-0"
                  />
                )}{" "}
                {emojiData.native && (
                  <span className="text-lg shrink-0 leading-none">{emojiData.native}</span>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium truncate">{emojiData.name}</span>
                  <span className="text-2xs truncate">{emojiData.shortcodes}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

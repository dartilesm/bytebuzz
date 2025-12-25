import type React from "react";
import { createContext, useContext, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import {
  EmojiCategory,
  EmojiSet,
  Locale,
  SkinTone,
  StorageKey,
} from "@/components/ui/emoji-picker-2/constants";
import {
  getCategoryIcon,
  getEmojiData,
} from "@/components/ui/emoji-picker-2/functions/emoji-picker-utils";
import {
  DEFAULT_FREQUENT_EMOJIS,
  getFrequentEmojis,
} from "@/components/ui/emoji-picker-2/functions/get-frequent-emojis";
import { useEmojiData } from "@/components/ui/emoji-picker-2/hooks/use-emoji-data";
import { useEmojiSearch } from "@/components/ui/emoji-picker-2/hooks/use-emoji-search";
import type {
  EmojiData,
  EmojiDataMap,
  UseEmojiDataOptions,
} from "@/components/ui/emoji-picker-2/types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// --- Types ---

interface EmojiPickerContextValue {
  data: EmojiDataMap;
  i18n: any;
  skin: number;
  setSkin: (skin: number) => void;
  onEmojiSelect?: (emoji: EmojiData) => void;
  categories: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: EmojiData[] | null;
  hoveredEmoji: EmojiData | null;
  setHoveredEmoji: (emoji: EmojiData | null) => void;
  frequentEmojis: string[];
  addFrequentEmoji: (emojiId: string) => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextValue | null>(null);

// --- Components ---

export interface EmojiPickerProps extends UseEmojiDataOptions {
  onEmojiSelect?: (emoji: EmojiData) => void;
  skin?: number;
  className?: string;
  children?: React.ReactNode;
}

export function EmojiPicker({
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
  children,
}: EmojiPickerProps) {
  const [skin, setSkin] = useLocalStorage<number>(StorageKey.SKIN_TONE, initialSkin);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiData | null>(null);
  const [frequentEmojiMap, setFrequentEmojiMap] = useLocalStorage<Record<string, number>>(
    StorageKey.FREQUENT_EMOJIS,
    {},
  );

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

  const searchResults = useEmojiSearch(searchQuery, initializedData?.data);

  function addFrequentEmoji(emojiId: string) {
    setFrequentEmojiMap((prev) => {
      const count = prev[emojiId] || 0;
      return { ...prev, [emojiId]: count + 1 };
    });
  }

  if (!initializedData) return null;

  const frequentEmojis = getFrequentEmojis(frequentEmojiMap);
  // If no frequent emojis, use defaults
  const effectiveFrequentEmojis =
    frequentEmojis.length > 0 ? frequentEmojis : DEFAULT_FREQUENT_EMOJIS;

  const contextValue: EmojiPickerContextValue = {
    data: initializedData.data,
    i18n: initializedData.i18n,
    skin,
    setSkin,
    onEmojiSelect,
    categories: initializedData.data.categories,
    searchQuery,
    setSearchQuery,
    searchResults,
    hoveredEmoji,
    setHoveredEmoji,
    frequentEmojis: effectiveFrequentEmojis,
    addFrequentEmoji,
  };

  return (
    <EmojiPickerContext.Provider value={contextValue}>
      <Tabs
        defaultValue={EmojiCategory.FREQUENT}
        className={cn(
          "flex flex-col w-87.5 h-112.5 border rounded-lg bg-background text-foreground shadow-sm",
          className,
        )}
      >
        {children}
      </Tabs>
    </EmojiPickerContext.Provider>
  );
}

// --- Subcomponents ---

export function EmojiPickerHeader({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn("p-2 border-b", className)}>{children}</div>;
}

export function EmojiPickerSearch({
  className,
  placeholder = "Search...",
}: {
  className?: string;
  placeholder?: string;
}) {
  const context = useContext(EmojiPickerContext);
  if (!context) throw new Error("EmojiPickerSearch must be used within EmojiPicker");

  const { setSearchQuery, searchQuery } = context;

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearch}
        className="w-full"
      />
    </div>
  );
}

export function EmojiPickerContent({ className }: { className?: string }) {
  const context = useContext(EmojiPickerContext);
  if (!context) throw new Error("EmojiPickerContent must be used within EmojiPicker");

  const { data, categories, searchResults, skin, onEmojiSelect, frequentEmojis, addFrequentEmoji } =
    context;

  function handleEmojiClick(emoji: EmojiData) {
    const finalEmoji = getEmojiData(emoji, { skinIndex: skin - 1 });
    onEmojiSelect?.(finalEmoji);
    addFrequentEmoji(emoji.id);
  }

  if (searchResults && searchResults.length > 0) {
    return (
      <div className={cn("flex-1 overflow-hidden", className)}>
        <ScrollArea className="h-full">
          <div className="px-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">Search Results</div>
            <div className="grid grid-cols-8 auto-cols-auto">
              {searchResults.map((emoji) => (
                <EmojiButton
                  key={emoji.id}
                  emoji={emoji}
                  skin={skin}
                  onClick={() => handleEmojiClick(emoji)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (searchResults && searchResults.length === 0) {
    return (
      <div
        className={cn("flex-1 flex items-center justify-center text-muted-foreground", className)}
      >
        No results found
      </div>
    );
  }

  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      {categories.map((category) => {
        const emojisToRender =
          category.id === EmojiCategory.FREQUENT ? frequentEmojis : category.emojis;

        return (
          <TabsContent
            key={category.id}
            value={category.id as string}
            className="h-full mt-0 border-0"
          >
            <ScrollArea className="h-full">
              <div className="px-2">
                <div className="grid grid-cols-8 auto-cols-auto">
                  {emojisToRender.map((emojiId: string) => {
                    const emoji = data.emojis[emojiId];
                    if (!emoji) return null;
                    return (
                      <EmojiButton
                        key={emoji.id}
                        emoji={emoji}
                        skin={skin}
                        onClick={() => handleEmojiClick(emoji)}
                      />
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        );
      })}
    </div>
  );
}

function EmojiButton({
  emoji,
  skin,
  onClick,
}: {
  emoji: EmojiData;
  skin: number;
  onClick: () => void;
}) {
  const context = useContext(EmojiPickerContext);
  const emojiData = getEmojiData(emoji, { skinIndex: skin - 1 });

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      onMouseEnter={() => context?.setHoveredEmoji(emoji)}
      onMouseLeave={() => context?.setHoveredEmoji(null)}
      title={emoji.name}
      className="p-1 h-9 w-9"
    >
      <span className="text-xl">{emojiData.native}</span>
    </Button>
  );
}

export function EmojiPickerCategoryNavigation({ className }: { className?: string }) {
  const context = useContext(EmojiPickerContext);
  if (!context) throw new Error("EmojiPickerCategoryNavigation must be used within EmojiPicker");

  const { categories, i18n } = context;

  return (
    <TabsList className={cn("flex w-full justify-between px-2 bg-accent/50", className)}>
      {categories.map((category) => {
        if (category.emojis.length === 0 && category.id !== EmojiCategory.FREQUENT) return null;
        const Icon = getCategoryIcon(category.id);
        const title = i18n.categories[category.id] || category.name || category.id;

        return (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex-1 px-0 h-8 data-[state=active]:bg-background"
            title={title}
          >
            <Icon className="h-4 w-4" />
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}

export function EmojiPickerFooter({ className }: { className?: string }) {
  const context = useContext(EmojiPickerContext);
  if (!context) throw new Error("EmojiPickerFooter must be used within EmojiPicker");

  const { hoveredEmoji, skin, setSkin } = context;
  const emojiData = hoveredEmoji ? getEmojiData(hoveredEmoji, { skinIndex: skin - 1 }) : null;

  const skinTones = [
    SkinTone.DEFAULT,
    SkinTone.LIGHT,
    SkinTone.MEDIUM_LIGHT,
    SkinTone.MEDIUM,
    SkinTone.MEDIUM_DARK,
    SkinTone.DARK,
  ];

  const skinColors = {
    [SkinTone.DEFAULT]: "#ffc93a",
    [SkinTone.LIGHT]: "#fadcbc",
    [SkinTone.MEDIUM_LIGHT]: "#e0bb95",
    [SkinTone.MEDIUM]: "#bf8f68",
    [SkinTone.MEDIUM_DARK]: "#9b643d",
    [SkinTone.DARK]: "#594539",
  };

  return (
    <div className={cn("h-14 border-t p-2 flex items-center justify-between gap-2", className)}>
      <div className="flex items-center gap-2 overflow-hidden">
        {emojiData && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="text-3xl shrink-0">{emojiData.native}</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{emojiData.name}</span>
              <span className="text-xs text-muted-foreground truncate">{emojiData.shortcodes}</span>
            </div>
          </div>
        )}
        {!emojiData && <div className="text-sm text-muted-foreground">Pick an emoji...</div>}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {skinTones.map((tone) => (
          <button
            key={tone}
            type="button"
            className={cn(
              "w-4 h-4 rounded-full border border-transparent hover:scale-110 transition-transform",
              skin === tone && "ring-2 ring-primary ring-offset-1",
            )}
            style={{
              backgroundColor: skinColors[tone as keyof typeof skinColors],
            }}
            onClick={() => setSkin(tone as number)}
            title={`Skin tone ${tone}`}
          />
        ))}
      </div>
    </div>
  );
}

// --- Exports ---

EmojiPicker.Header = EmojiPickerHeader;
EmojiPicker.Search = EmojiPickerSearch;
EmojiPicker.Content = EmojiPickerContent;
EmojiPicker.CategoryNavigation = EmojiPickerCategoryNavigation;
EmojiPicker.Footer = EmojiPickerFooter;

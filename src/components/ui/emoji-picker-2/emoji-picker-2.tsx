import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { default as emojiData } from "@emoji-mart/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Data, I18n, init } from "./config";
import { getCategoryIcon, getEmojiData } from "./functions/emoji-picker-utils";
import { FrequentlyUsed, SearchIndex } from "./helpers";

// --- Types ---

interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
  skin?: number;
  src?: string;
  aliases?: string[];
  emoticons?: string[];
}

interface EmojiPickerContextValue {
  data: any;
  i18n: any;
  skin: number;
  setSkin: (skin: number) => void;
  onEmojiSelect?: (emoji: EmojiData) => void;
  categories: any[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[] | null;
  setSearchResults: (results: any[] | null) => void;
  hoveredEmoji: any | null;
  setHoveredEmoji: (emoji: any | null) => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextValue | null>(null);

// --- Components ---

interface EmojiPickerProps {
  data?: any;
  i18n?: any;
  onEmojiSelect?: (emoji: EmojiData) => void;
  theme?: "light" | "dark" | "auto";
  skin?: number;
  set?: "native" | "apple" | "facebook" | "google" | "twitter";
  locale?: string;
  categories?: string[];
  custom?: any[];
  className?: string;
  children?: React.ReactNode;
}

function EmojiPicker({
  data = emojiData,
  i18n,
  onEmojiSelect,
  theme = "auto",
  skin: initialSkin = 1,
  set = "native",
  locale = "en",
  categories,
  custom,
  className,
  children,
}: EmojiPickerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [skin, setSkin] = useState(initialSkin);
  const [activeCategory, setActiveCategory] = useState("frequent");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [hoveredEmoji, setHoveredEmoji] = useState<any | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await init({
        data,
        i18n,
        set,
        locale,
        custom,
      });
      setIsInitialized(true);
    };
    initialize();
  }, [data, i18n, set, locale, custom]);

  if (!isInitialized) return null;

  const contextValue: EmojiPickerContextValue = {
    data: Data,
    i18n: I18n,
    skin,
    setSkin,
    onEmojiSelect,
    categories: Data.categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    hoveredEmoji,
    setHoveredEmoji,
  };

  return (
    <EmojiPickerContext.Provider value={contextValue}>
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className={cn(
          "flex flex-col w-[350px] h-[450px] border rounded-lg bg-background text-foreground shadow-sm",
          className,
        )}
      >
        {children}
      </Tabs>
    </EmojiPickerContext.Provider>
  );
}

// --- Subcomponents ---

function EmojiPickerHeader({
  className,
  children,
}: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("p-2 border-b", className)}>{children}</div>;
}

function EmojiPickerSearch({
  className,
  placeholder = "Search...",
}: { className?: string; placeholder?: string }) {
  const context = useContext(EmojiPickerContext);
  if (!context)
    throw new Error("EmojiPickerSearch must be used within EmojiPicker");

  const { setSearchQuery, setSearchResults } = context;

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults(null);
      return;
    }

    const results = await SearchIndex.search(query);
    setSearchResults(results);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={context.searchQuery}
        onChange={handleSearch}
        className="w-full"
      />
    </div>
  );
}

function EmojiPickerContent({ className }: { className?: string }) {
  const context = useContext(EmojiPickerContext);
  if (!context)
    throw new Error("EmojiPickerContent must be used within EmojiPicker");

  const { data, categories, searchResults, skin, onEmojiSelect } = context;

  const handleEmojiClick = (emoji: any) => {
    const emojiData = getEmojiData(emoji, { skinIndex: skin - 1 });
    onEmojiSelect?.(emojiData);
    FrequentlyUsed.add(emoji);
  };

  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      {searchResults && (
        <ScrollArea className="h-full">
          <div className="px-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Search Results
            </div>
            <div className="grid grid-cols-8 auto-cols-auto ">
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
      )}
      {!searchResults &&
        categories.map((category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="h-full mt-0 border-0"
          >
            <ScrollArea className="h-full">
              <div className="px-2">
                <div className="grid grid-cols-8 auto-cols-auto">
                  {category.emojis.map((emojiId: string) => {
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
        ))}
    </div>
  );
}

function EmojiButton({
  emoji,
  skin,
  onClick,
}: {
  emoji: any;
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
    >
      {emojiData.native}
    </Button>
  );
}

function EmojiPickerCategoryNavigation({ className }: { className?: string }) {
  const context = useContext(EmojiPickerContext);
  if (!context)
    throw new Error(
      "EmojiPickerCategoryNavigation must be used within EmojiPicker",
    );

  const { categories } = context;

  return (
    <TabsList
      className={cn("flex w-full justify-between px-2 bg-accent/50", className)}
    >
      {categories.map((category) => {
        if (category.emojis.length === 0) return null;
        const Icon = getCategoryIcon(category.id);
        return (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex-1 px-0 h-8 data-[state=active]:bg-background"
            title={context.i18n.categories[category.id]}
          >
            <Icon className="h-4 w-4" />
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}

function EmojiPickerFooter({ className }: { className?: string }) {
  const context = useContext(EmojiPickerContext);
  if (!context)
    throw new Error("EmojiPickerFooter must be used within EmojiPicker");

  const { hoveredEmoji, skin, setSkin } = context;
  const emojiData = hoveredEmoji
    ? getEmojiData(hoveredEmoji, { skinIndex: skin - 1 })
    : null;

  const skinTones = [1, 2, 3, 4, 5, 6];

  return (
    <div
      className={cn(
        "h-14 border-t p-2 flex items-center justify-between gap-2",
        className,
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {emojiData && (
          <>
            <div className="text-3xl shrink-0">{emojiData.native}</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">
                {emojiData.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {emojiData.shortcodes}
              </span>
            </div>
          </>
        )}
        {!emojiData && (
          <div className="text-sm text-muted-foreground">Pick an emoji...</div>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {skinTones.map((tone) => (
          <button
            key={tone}
            className={cn(
              "w-4 h-4 rounded-full border border-transparent hover:scale-110 transition-transform",
              skin === tone && "ring-2 ring-primary ring-offset-1",
            )}
            style={{
              backgroundColor: {
                1: "#ffc93a",
                2: "#fadcbc",
                3: "#e0bb95",
                4: "#bf8f68",
                5: "#9b643d",
                6: "#594539",
              }[tone],
            }}
            onClick={() => setSkin(tone)}
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

export { EmojiPicker };

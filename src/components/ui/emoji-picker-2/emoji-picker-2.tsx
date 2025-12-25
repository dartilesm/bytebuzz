import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react'
import {
  Activity,
  Clock,
  Flag,
  Lightbulb,
  Plane,
  Search,
  Smile,
  Trees,
  Utensils,
  Users,
  Star,
  Music,
  Baby,
  Dumbbell,
  Heart,
  AlertCircle
} from 'lucide-react'
import { init, Data, I18n } from './config'
import { SearchIndex, FrequentlyUsed, Store } from './helpers'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {default as emojiData} from '@emoji-mart/data'

function getEmojiData(emoji, { skinIndex = 0 } = {}) {
  const skin =
    emoji.skins[skinIndex] ||
    (() => {
      skinIndex = 0
      return emoji.skins[skinIndex]
    })()

  const emojiData: any = {
    id: emoji.id,
    name: emoji.name,
    native: skin.native,
    unified: skin.unified,
    keywords: emoji.keywords,
    shortcodes: skin.shortcodes || emoji.shortcodes,
  }

  if (emoji.skins.length > 1) {
    emojiData.skin = skinIndex + 1
  }

  if (skin.src) {
    emojiData.src = skin.src
  }

  if (emoji.aliases && emoji.aliases.length) {
    emojiData.aliases = emoji.aliases
  }

  if (emoji.emoticons && emoji.emoticons.length) {
    emojiData.emoticons = emoji.emoticons
  }

  return emojiData
}

// --- Types ---

interface EmojiData {
  id: string
  name: string
  native: string
  unified: string
  keywords: string[]
  shortcodes: string
  skin?: number
  src?: string
  aliases?: string[]
  emoticons?: string[]
}

interface EmojiPickerContextValue {
  data: any
  i18n: any
  skin: number
  setSkin: (skin: number) => void
  onEmojiSelect?: (emoji: EmojiData) => void
  categories: any[]
  activeCategory: string
  setActiveCategory: (category: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: any[] | null
  hoveredEmoji: any | null
  setHoveredEmoji: (emoji: any | null) => void
}

const EmojiPickerContext = createContext<EmojiPickerContextValue | null>(null)

// --- Components ---

interface EmojiPickerProps {
  data?: any
  i18n?: any
  onEmojiSelect?: (emoji: EmojiData) => void
  theme?: 'light' | 'dark' | 'auto'
  skin?: number
  set?: 'native' | 'apple' | 'facebook' | 'google' | 'twitter'
  locale?: string
  categories?: string[]
  custom?: any[]
  className?: string
  children?: React.ReactNode
}

const EmojiPicker = ({
  data = emojiData,
  i18n,
  onEmojiSelect,
  theme = 'auto',
  skin: initialSkin = 1,
  set = 'native',
  locale = 'en',
  categories,
  custom,
  className,
  children,
}: EmojiPickerProps) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [skin, setSkin] = useState(initialSkin)
  const [activeCategory, setActiveCategory] = useState('frequent')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [hoveredEmoji, setHoveredEmoji] = useState<any | null>(null)

  useEffect(() => {
    const initialize = async () => {
      await init({
        data,
        i18n,
        set,
        locale,
        custom,
      })
      setIsInitialized(true)
    }
    initialize()
  }, [data, i18n, set, locale, custom])

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults(null)
      return
    }

    const search = async () => {
      const results = await SearchIndex.search(searchQuery)
      setSearchResults(results)
    }
    search()
  }, [searchQuery])

  if (!isInitialized) return null

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
    hoveredEmoji,
    setHoveredEmoji,
  }

  return (
    <EmojiPickerContext.Provider value={contextValue}>
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className={cn(
          'flex flex-col w-[350px] h-[450px] border rounded-lg bg-background text-foreground shadow-sm',
          className
        )}
      >
        {children}
      </Tabs>
    </EmojiPickerContext.Provider>
  )
}

// --- Subcomponents ---

const EmojiPickerHeader = ({ className, children }: { className?: string, children?: React.ReactNode }) => {
  return <div className={cn('p-2 border-b', className)}>{children}</div>
}

const EmojiPickerSearch = ({ className, placeholder = 'Search...' }: { className?: string, placeholder?: string }) => {
  const context = useContext(EmojiPickerContext)
  if (!context) throw new Error('EmojiPickerSearch must be used within EmojiPicker')

  return (
    <div className={cn('relative', className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={context.searchQuery}
        onChange={(e) => context.setSearchQuery(e.target.value)}
        className="w-full"
      />
    </div>
  )
}

const EmojiPickerContent = ({ className }: { className?: string }) => {
  const context = useContext(EmojiPickerContext)
  if (!context) throw new Error('EmojiPickerContent must be used within EmojiPicker')

  const {
    data,
    categories,
    searchResults,
    skin,
    onEmojiSelect,
  } = context

  const handleEmojiClick = (emoji: any) => {
    const emojiData = getEmojiData(emoji, { skinIndex: skin - 1 })
    onEmojiSelect?.(emojiData)
    FrequentlyUsed.add(emoji)
  }

  return (
    <div className={cn('flex-1 overflow-hidden', className)}>
      {searchResults ? (
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
      ) : (
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
                    const emoji = data.emojis[emojiId]
                    if (!emoji) return null
                    return (
                      <EmojiButton
                        key={emoji.id}
                        emoji={emoji}
                        skin={skin}
                        onClick={() => handleEmojiClick(emoji)}
                      />
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        ))
      )}
    </div>
  )
}

const EmojiButton = ({
  emoji,
  skin,
  onClick,
}: {
  emoji: any
  skin: number
  onClick: () => void
}) => {
  const context = useContext(EmojiPickerContext)
  const emojiData = getEmojiData(emoji, { skinIndex: skin - 1 })
  
  return (
    <button
      className="flex items-center justify-center rounded hover:bg-accent text-xl"
      onClick={onClick}
      onMouseEnter={() => context?.setHoveredEmoji(emoji)}
      onMouseLeave={() => context?.setHoveredEmoji(null)}
      title={emoji.name}
    >
      {emojiData.native}
    </button>
  )
}

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'frequent':
      return Clock
    case 'people':
      return Smile
    case 'nature':
      return Trees
    case 'foods':
      return Utensils
    case 'activity':
      return Activity
    case 'places':
      return Plane
    case 'objects':
      return Lightbulb
    case 'symbols':
      return Star
    case 'flags':
      return Flag
    default:
      return AlertCircle
  }
}

const EmojiPickerCategoryNavigation = ({ className }: { className?: string }) => {
  const context = useContext(EmojiPickerContext)
  if (!context) throw new Error('EmojiPickerCategoryNavigation must be used within EmojiPicker')

  const { categories } = context

  return (
    <TabsList className={cn('flex w-full justify-between px-2 bg-accent/50', className)}>
      {categories.map((category) => {
        if (category.emojis.length === 0) return null
        const Icon = getCategoryIcon(category.id)
        return (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex-1 px-0 h-8 data-[state=active]:bg-background"
            title={context.i18n.categories[category.id]}
          >
            <Icon className="h-4 w-4" />
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}

const EmojiPickerFooter = ({ className }: { className?: string }) => {
  const context = useContext(EmojiPickerContext)
  if (!context) throw new Error('EmojiPickerFooter must be used within EmojiPicker')

  const { hoveredEmoji, skin, setSkin } = context
  const emojiData = hoveredEmoji ? getEmojiData(hoveredEmoji, { skinIndex: skin - 1 }) : null

  const skinTones = [1, 2, 3, 4, 5, 6]

  return (
    <div className={cn('h-14 border-t p-2 flex items-center justify-between gap-2', className)}>
      <div className="flex items-center gap-2 overflow-hidden">
        {emojiData ? (
          <>
            <div className="text-3xl shrink-0">{emojiData.native}</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{emojiData.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {emojiData.shortcodes}
              </span>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Pick an emoji...</div>
        )}
      </div>
      
      <div className="flex items-center gap-0.5 shrink-0">
        {skinTones.map((tone) => (
          <button
            key={tone}
            className={cn(
              "w-4 h-4 rounded-full border border-transparent hover:scale-110 transition-transform",
              skin === tone && "ring-2 ring-primary ring-offset-1"
            )}
            style={{
              backgroundColor: {
                1: '#ffc93a',
                2: '#fadcbc',
                3: '#e0bb95',
                4: '#bf8f68',
                5: '#9b643d',
                6: '#594539',
              }[tone]
            }}
            onClick={() => setSkin(tone)}
            title={`Skin tone ${tone}`}
          />
        ))}
      </div>
    </div>
  )
}


// --- Exports ---

EmojiPicker.Header = EmojiPickerHeader
EmojiPicker.Search = EmojiPickerSearch
EmojiPicker.Content = EmojiPickerContent
EmojiPicker.CategoryNavigation = EmojiPickerCategoryNavigation
EmojiPicker.Footer = EmojiPickerFooter

export { EmojiPicker }

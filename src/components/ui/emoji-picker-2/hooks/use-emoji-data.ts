import { useQuery } from "@tanstack/react-query";
import { EmojiSet, Locale } from "@/components/ui/emoji-picker-2/constants";
import { processEmojiData } from "@/components/ui/emoji-picker-2/functions/process-emoji-data";
import type { EmojiDataMap, UseEmojiDataOptions } from "@/components/ui/emoji-picker-2/types";

const DEFAULT_LOCALE = Locale.EN;
const DEFAULT_SET = EmojiSet.NATIVE;
const DEFAULT_VERSION = 15;

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
}

/**
 * Hook to fetch and process emoji data
 */
export function useEmojiData(options: UseEmojiDataOptions = {}) {
  const { set = DEFAULT_SET, locale = DEFAULT_LOCALE, emojiVersion = DEFAULT_VERSION } = options;

  return useQuery({
    queryKey: ["emoji-data", { set, locale, emojiVersion, options }],
    queryFn: async () => {
      const [data, i18n] = await Promise.all([
        fetchJson(
          `https://cdn.jsdelivr.net/npm/@emoji-mart/data@latest/sets/${emojiVersion}/${set}.json`,
        ),
        locale === "en"
          ? import("@emoji-mart/data/i18n/en.json").then((m) => m.default)
          : fetchJson(`https://cdn.jsdelivr.net/npm/@emoji-mart/data@latest/i18n/${locale}.json`),
      ]);

      const processedData = processEmojiData(data, options);

      return {
        data: processedData as EmojiDataMap,
        i18n,
      };
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

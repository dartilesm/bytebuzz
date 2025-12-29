import { useQueries } from "@tanstack/react-query";
import { EmojiSet, Locale } from "@/components/ui/emoji-picker/constants";
import { processEmojiData } from "@/components/ui/emoji-picker/functions/process-emoji-data";
import type { EmojiDataMap, UseEmojiDataOptions } from "@/components/ui/emoji-picker/types";
import { emojiQueries } from "@/hooks/queries/options/emoji-queries";

const DEFAULT_LOCALE = Locale.EN;
const DEFAULT_SET = EmojiSet.NATIVE;
const DEFAULT_VERSION = 15;

/**
 * Hook to fetch and process emoji data
 */
export function useEmojiData(options: UseEmojiDataOptions = {}) {
  const { set = DEFAULT_SET, locale = DEFAULT_LOCALE, emojiVersion = DEFAULT_VERSION } = options;

  return useQueries({
    queries: [emojiQueries.defaults({ set, locale, emojiVersion }), emojiQueries.custom()],
    combine: ([defaults, custom]) => {
      const isPending = defaults.isPending || custom.isPending;
      const isError = defaults.isError || custom.isError;

      if (!defaults.data) {
        return {
          data: undefined,
          isPending,
          isError,
        };
      }

      const { data, i18n } = defaults.data;
      const mergedCustom = [...(options.custom || []), ...(custom.data || [])];

      const processedData = processEmojiData(data, { ...options, custom: mergedCustom });

      return {
        data: {
          data: processedData as EmojiDataMap,
          i18n,
        },
        isPending,
        isError,
      };
    },
  });
}

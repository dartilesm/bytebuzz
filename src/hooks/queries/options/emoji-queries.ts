import { queryOptions } from "@tanstack/react-query";
import type { EmojiSet, Locale } from "@/components/ui/emoji-picker-2/constants";
import type { CustomEmoji } from "@/components/ui/emoji-picker-2/types";

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
}

interface DefaultEmojiQueryOptions {
  set: EmojiSet;
  locale: Locale;
  emojiVersion: number;
}

export const emojiQueries = {
  defaults: ({ set, locale, emojiVersion }: DefaultEmojiQueryOptions) =>
    queryOptions({
      queryKey: ["emoji-data", "defaults", { set, locale, emojiVersion }],
      queryFn: async () => {
        const [data, i18n] = await Promise.all([
          fetchJson(
            `https://cdn.jsdelivr.net/npm/@emoji-mart/data@latest/sets/${emojiVersion}/${set}.json`,
          ),
          locale === "en"
            ? import("@emoji-mart/data/i18n/en.json").then((m) => m.default)
            : fetchJson(`https://cdn.jsdelivr.net/npm/@emoji-mart/data@latest/i18n/${locale}.json`),
        ]);
        return { data, i18n };
      },
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }),

  custom: () =>
    queryOptions({
      queryKey: ["emoji-data", "custom"],
      queryFn: async () => {
        const res = await fetch("/api/emoji");
        if (!res.ok) {
          throw new Error("Failed to fetch custom emojis");
        }
        return (await res.json()) as CustomEmoji[];
      },
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }),
};

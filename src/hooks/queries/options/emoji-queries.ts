import { queryOptions } from "@tanstack/react-query";
import { Data, I18n, init } from "@/components/ui/emoji-picker-2/config";

export const emojiQueries = {
  data: (options: any) =>
    queryOptions({
      queryKey: [
        "emoji-data",
        { set: options.set, locale: options.locale, custom: options.custom },
      ],
      queryFn: async () => {
        await init(options);
        return { data: Data, i18n: I18n };
      },
      staleTime: Infinity,
    }),
};

import { queryOptions } from "@tanstack/react-query";
import { extractDominantColors } from "@/lib/image-color-extractor";

export const imageQueries = {
  dominantColors: (imageUrl: string | undefined, colorCount = 5) =>
    queryOptions({
      queryKey: ["dominant-colors", imageUrl, colorCount],
      queryFn: () => {
        if (!imageUrl) throw new Error("Image URL is required");
        return extractDominantColors(imageUrl, colorCount);
      },
      enabled: !!imageUrl,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours, colors of an image rarely change
    }),
};


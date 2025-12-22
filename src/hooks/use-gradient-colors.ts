import { useQuery } from "@tanstack/react-query";
import { imageQueries } from "@/hooks/queries/options/image-queries";

interface UseGradientColorsOptions {
  imageUrl?: string;
  colors?: string[];
  colorCount?: number;
}

interface UseGradientColorsReturn {
  colors: string[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to extract dominant colors from an image or use pre-computed colors
 * @param options - Configuration options
 * @param options.imageUrl - URL of the image to extract colors from
 * @param options.colors - Pre-computed colors (takes precedence over imageUrl)
 * @param options.colorCount - Number of colors to extract (default: 5)
 * @returns Object containing colors array, loading state, and error state
 */
export function useGradientColors({
  imageUrl,
  colors: providedColors,
  colorCount = 5,
}: UseGradientColorsOptions): UseGradientColorsReturn {
  const hasProvidedColors = Boolean(providedColors && providedColors.length > 0);

  const {
    data: extractedColors,
    isLoading,
    error,
  } = useQuery({
    ...imageQueries.dominantColors(imageUrl, colorCount),
    enabled: !hasProvidedColors && !!imageUrl,
  });

  return {
    colors: hasProvidedColors ? (providedColors as string[]) : extractedColors || [],
    isLoading: !hasProvidedColors && isLoading,
    error: error as Error | null,
  };
}

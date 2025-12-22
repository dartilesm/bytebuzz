import type { MediaData } from "@/components/lexical-editor/plugins/media/media-node";

/**
 * Extracts image dimensions from a File object or URL string
 * Uses browser's Image API to get natural width and height
 * @param source - File object or URL string
 * @returns Promise resolving to dimensions object or null if extraction fails
 */
export async function getImageDimensions(
  source: File | string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      resolve(null);
    };

    if (source instanceof File) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Creates media data for a blob URL (used for immediate preview)
 * Extracts image dimensions if the file is an image
 * @param file - The file to create media data for
 * @returns Promise resolving to MediaData object with blob URL and dimensions
 */
export async function createBlobMediaData(file: File): Promise<MediaData> {
  const src = URL.createObjectURL(file);
  const isImage = file.type.startsWith("image/");

  const baseData: MediaData = {
    id: `media-${Date.now()}`,
    type: isImage ? "image" : "video",
    src,
    title: file.name,
    alt: isImage ? file.name : undefined,
  };

  if (isImage) {
    const dimensions = await getImageDimensions(file);
    if (dimensions) {
      baseData.width = dimensions.width;
      baseData.height = dimensions.height;
    }
  }

  return baseData;
}

/**
 * Creates loading media data for custom upload process
 * Extracts image dimensions if the file is an image
 * @param file - The file being uploaded
 * @returns Promise resolving to MediaData object with loading state and dimensions
 */
export async function createLoadingMediaData(file: File): Promise<MediaData> {
  const mediaData = await createBlobMediaData(file);
  return {
    ...mediaData,
    isLoading: true,
  };
}

/**
 * Validates if a file is a supported media type
 * @param file - The file to validate
 * @returns Object with validation result and file type info
 */
export function validateMediaFile(file: File) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isValid = isImage || isVideo;

  return {
    isValid,
    isImage,
    isVideo,
    type: isImage ? ("image" as const) : isVideo ? ("video" as const) : null,
  };
}

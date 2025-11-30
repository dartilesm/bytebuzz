import type { MediaData } from "@/components/lexical-editor/plugins/media/media-node";

/**
 * Creates media data for a blob URL (used for immediate preview)
 * @param file - The file to create media data for
 * @returns MediaData object with blob URL
 */
export function createBlobMediaData(file: File): MediaData {
  const src = URL.createObjectURL(file);
  const isImage = file.type.startsWith("image/");

  return {
    id: `media-${Date.now()}`,
    type: isImage ? "image" : "video",
    src,
    title: file.name,
    alt: isImage ? file.name : undefined,
  };
}

/**
 * Creates loading media data for custom upload process
 * @param file - The file being uploaded
 * @returns MediaData object with loading state
 */
export function createLoadingMediaData(file: File): MediaData {
  return {
    ...createBlobMediaData(file),
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

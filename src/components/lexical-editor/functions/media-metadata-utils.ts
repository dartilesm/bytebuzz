import type { MediaData } from "@/components/lexical-editor/plugins/media/media-node";

/**
 * Metadata that can be stored in markdown for media files
 * This interface can be extended in the future to include more fields
 */
export interface MediaMetadata {
  id: string;
  type: "image" | "video";
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  // Future fields can be added here without breaking existing code
  [key: string]: unknown;
}

/**
 * Encodes media metadata into a URL query parameter
 * Uses JSON encoding for extensibility
 *
 * @param src - The original media source URL
 * @param metadata - The metadata to encode
 * @returns The URL with metadata appended as a query parameter
 */
export function encodeMediaMetadata(src: string, metadata: MediaMetadata): string {
  try {
    // Handle relative URLs by creating a temporary absolute URL
    let url: URL;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) {
      url = new URL(src);
    } else {
      // For relative URLs, use a base URL
      url = new URL(
        src,
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
    }

    const encodedMetadata = encodeURIComponent(JSON.stringify(metadata));
    url.searchParams.set("meta", encodedMetadata);

    // Return relative URL if original was relative
    if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("//")) {
      return url.pathname + url.search + url.hash;
    }

    return url.toString();
  } catch {
    // If URL parsing fails, append as query string
    const separator = src.includes("?") ? "&" : "?";
    const encodedMetadata = encodeURIComponent(JSON.stringify(metadata));
    return `${src}${separator}meta=${encodedMetadata}`;
  }
}

/**
 * Decodes media metadata from a URL query parameter
 *
 * @param url - The URL containing encoded metadata
 * @returns An object with the decoded metadata and the cleaned source URL
 */
export function decodeMediaMetadata(url: string): {
  metadata: Partial<MediaMetadata> | null;
  src: string;
} {
  try {
    // Handle relative URLs by creating a temporary absolute URL
    let urlObj: URL;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
      urlObj = new URL(url);
    } else {
      // For relative URLs, use a base URL
      urlObj = new URL(
        url,
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
    }

    const metaParam = urlObj.searchParams.get("meta");

    if (!metaParam) {
      return { metadata: null, src: url };
    }

    // Remove the meta parameter from the URL
    urlObj.searchParams.delete("meta");

    // Preserve original URL format (relative vs absolute)
    let cleanSrc: string;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
      cleanSrc = urlObj.toString();
    } else {
      cleanSrc = urlObj.pathname + urlObj.search + urlObj.hash;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(metaParam)) as Partial<MediaMetadata>;
      return { metadata: decoded, src: cleanSrc };
    } catch {
      // If JSON parsing fails, return null metadata but still clean the URL
      return { metadata: null, src: cleanSrc };
    }
  } catch {
    // If URL parsing fails, try to extract from query string manually
    const metaMatch = url.match(/[?&]meta=([^&]+)/);
    if (metaMatch) {
      try {
        const decoded = JSON.parse(decodeURIComponent(metaMatch[1])) as Partial<MediaMetadata>;
        // Remove meta parameter while preserving other query params
        const cleanSrc = url
          .replace(/[?&]meta=[^&]+/, (_match, offset) => {
            // If this is the first param, use ?, otherwise use &
            return offset === 0 ? "?" : "";
          })
          .replace(/[?&]$/, "")
          .replace(/&$/, "");
        return { metadata: decoded, src: cleanSrc || url.split("?")[0] };
      } catch {
        const cleanSrc = url.replace(/[?&]meta=[^&]+/, "").replace(/[?&]$/, "");
        return { metadata: null, src: cleanSrc || url.split("?")[0] };
      }
    }
    return { metadata: null, src: url };
  }
}

/**
 * Converts MediaData to MediaMetadata format
 *
 * @param mediaData - The MediaData object to convert
 * @returns MediaMetadata object
 */
export function mediaDataToMetadata(mediaData: MediaData): MediaMetadata {
  return {
    id: mediaData.id,
    type: mediaData.type,
    alt: mediaData.alt,
    title: mediaData.title,
    width: mediaData.width,
    height: mediaData.height,
  };
}

/**
 * Converts MediaMetadata to MediaData format
 * Merges metadata with the source URL
 *
 * @param metadata - The MediaMetadata object
 * @param src - The source URL
 * @returns MediaData object
 */
export function metadataToMediaData(metadata: Partial<MediaMetadata>, src: string): MediaData {
  return {
    id: metadata.id || src.split("/").pop() || `media-${Date.now()}`,
    type: metadata.type || (src.match(/\.(mp4|webm|ogg|mov)$/i) ? "video" : "image"),
    src,
    alt: metadata.alt,
    title: metadata.title,
    width: metadata.width,
    height: metadata.height,
  };
}

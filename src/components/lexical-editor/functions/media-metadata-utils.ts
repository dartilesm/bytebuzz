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
  postId?: string; // Critical for API route to locate files in posts directory
  // Future fields can be added here without breaking existing code
  [key: string]: unknown;
}

/**
 * Encodes media metadata into URL query parameters
 * Uses flat query parameters for readability (like nuqs style)
 * Critical fields like postId are kept as top-level params for API compatibility
 *
 * @param src - The original media source URL
 * @param metadata - The metadata to encode
 * @returns The URL with metadata as readable query parameters
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

    // Preserve existing query parameters (like postId if already in URL)
    // Then add/update metadata fields as flat query parameters

    // Critical: postId must be a top-level query param for API route compatibility
    if (metadata.postId) {
      url.searchParams.set("postId", metadata.postId);
    }

    // Add other metadata fields as flat query parameters for readability
    if (metadata.id) {
      url.searchParams.set("id", metadata.id);
    }
    if (metadata.type) {
      url.searchParams.set("type", metadata.type);
    }
    if (metadata.alt) {
      url.searchParams.set("alt", metadata.alt);
    }
    if (metadata.title) {
      url.searchParams.set("title", metadata.title);
    }
    if (metadata.width !== undefined) {
      url.searchParams.set("width", metadata.width.toString());
    }
    if (metadata.height !== undefined) {
      url.searchParams.set("height", metadata.height.toString());
    }

    // Return relative URL if original was relative
    if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("//")) {
      return url.pathname + url.search + url.hash;
    }

    return url.toString();
  } catch {
    // If URL parsing fails, append as query string manually
    const separator = src.includes("?") ? "&" : "?";
    const params: string[] = [];

    if (metadata.postId) params.push(`postId=${encodeURIComponent(metadata.postId)}`);
    if (metadata.id) params.push(`id=${encodeURIComponent(metadata.id)}`);
    if (metadata.type) params.push(`type=${encodeURIComponent(metadata.type)}`);
    if (metadata.alt) params.push(`alt=${encodeURIComponent(metadata.alt)}`);
    if (metadata.title) params.push(`title=${encodeURIComponent(metadata.title)}`);
    if (metadata.width !== undefined) params.push(`width=${metadata.width}`);
    if (metadata.height !== undefined) params.push(`height=${metadata.height}`);

    return `${src}${separator}${params.join("&")}`;
  }
}

/**
 * Decodes media metadata from URL query parameters
 * Reads flat query parameters for readability and API compatibility
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

    // Extract metadata from flat query parameters
    const metadata: Partial<MediaMetadata> = {};
    let hasMetadata = false;

    // Critical: postId is preserved for API route compatibility
    const postId = urlObj.searchParams.get("postId");
    if (postId) {
      metadata.postId = postId;
      hasMetadata = true;
    }

    const id = urlObj.searchParams.get("id");
    if (id) {
      metadata.id = id;
      hasMetadata = true;
    }

    const type = urlObj.searchParams.get("type");
    if (type && (type === "image" || type === "video")) {
      metadata.type = type as "image" | "video";
      hasMetadata = true;
    }

    const alt = urlObj.searchParams.get("alt");
    if (alt) {
      metadata.alt = alt;
      hasMetadata = true;
    }

    const title = urlObj.searchParams.get("title");
    if (title) {
      metadata.title = title;
      hasMetadata = true;
    }

    const width = urlObj.searchParams.get("width");
    if (width) {
      const widthNum = Number.parseInt(width, 10);
      if (!Number.isNaN(widthNum)) {
        metadata.width = widthNum;
        hasMetadata = true;
      }
    }

    const height = urlObj.searchParams.get("height");
    if (height) {
      const heightNum = Number.parseInt(height, 10);
      if (!Number.isNaN(heightNum)) {
        metadata.height = heightNum;
        hasMetadata = true;
      }
    }

    // Remove metadata parameters from URL to get clean source
    // BUT: Keep postId as it's needed by the API route
    urlObj.searchParams.delete("id");
    urlObj.searchParams.delete("type");
    urlObj.searchParams.delete("alt");
    urlObj.searchParams.delete("title");
    urlObj.searchParams.delete("width");
    urlObj.searchParams.delete("height");
    // Note: We intentionally keep postId in the URL

    // Preserve original URL format (relative vs absolute)
    let cleanSrc: string;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
      cleanSrc = urlObj.toString();
    } else {
      cleanSrc = urlObj.pathname + urlObj.search + urlObj.hash;
    }

    return { metadata: hasMetadata ? metadata : null, src: cleanSrc };
  } catch {
    // If URL parsing fails, try to extract from query string manually
    const metadata: Partial<MediaMetadata> = {};
    let hasMetadata = false;

    // Extract postId
    const postIdMatch = url.match(/[?&]postId=([^&]+)/);
    if (postIdMatch) {
      metadata.postId = decodeURIComponent(postIdMatch[1]);
      hasMetadata = true;
    }

    // Extract other params
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch) {
      metadata.id = decodeURIComponent(idMatch[1]);
      hasMetadata = true;
    }

    const typeMatch = url.match(/[?&]type=([^&]+)/);
    if (typeMatch) {
      const type = decodeURIComponent(typeMatch[1]);
      if (type === "image" || type === "video") {
        metadata.type = type;
        hasMetadata = true;
      }
    }

    const altMatch = url.match(/[?&]alt=([^&]+)/);
    if (altMatch) {
      metadata.alt = decodeURIComponent(altMatch[1]);
      hasMetadata = true;
    }

    const titleMatch = url.match(/[?&]title=([^&]+)/);
    if (titleMatch) {
      metadata.title = decodeURIComponent(titleMatch[1]);
      hasMetadata = true;
    }

    const widthMatch = url.match(/[?&]width=([^&]+)/);
    if (widthMatch) {
      const widthNum = Number.parseInt(decodeURIComponent(widthMatch[1]), 10);
      if (!Number.isNaN(widthNum)) {
        metadata.width = widthNum;
        hasMetadata = true;
      }
    }

    const heightMatch = url.match(/[?&]height=([^&]+)/);
    if (heightMatch) {
      const heightNum = Number.parseInt(decodeURIComponent(heightMatch[1]), 10);
      if (!Number.isNaN(heightNum)) {
        metadata.height = heightNum;
        hasMetadata = true;
      }
    }

    // Clean URL - remove metadata params but keep postId (it's needed by API route)
    // postId is already in the URL from the original, so we just remove other metadata params
    const cleanSrc = url
      .replace(/[?&]id=[^&]+/g, "")
      .replace(/[?&]type=[^&]+/g, "")
      .replace(/[?&]alt=[^&]+/g, "")
      .replace(/[?&]title=[^&]+/g, "")
      .replace(/[?&]width=[^&]+/g, "")
      .replace(/[?&]height=[^&]+/g, "")
      .replace(/[?&]{2,}/g, "&")
      .replace(/[?&]$/, "")
      .replace(/&$/, "");

    // postId should already be in cleanSrc if it was in the original URL
    // No need to add it back since we didn't remove it

    return { metadata: hasMetadata ? metadata : null, src: cleanSrc || url.split("?")[0] };
  }
}

/**
 * Converts MediaData to MediaMetadata format
 * Extracts postId from src URL if present
 *
 * @param mediaData - The MediaData object to convert
 * @returns MediaMetadata object
 */
export function mediaDataToMetadata(mediaData: MediaData): MediaMetadata {
  // Extract postId from src URL if it exists as a query parameter
  let postId: string | undefined;
  try {
    const url = new URL(
      mediaData.src,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    );
    postId = url.searchParams.get("postId") || undefined;
  } catch {
    // If URL parsing fails, try regex
    const postIdMatch = mediaData.src.match(/[?&]postId=([^&]+)/);
    if (postIdMatch) {
      postId = decodeURIComponent(postIdMatch[1]);
    }
  }

  return {
    id: mediaData.id,
    type: mediaData.type,
    alt: mediaData.alt,
    title: mediaData.title,
    width: mediaData.width,
    height: mediaData.height,
    postId,
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

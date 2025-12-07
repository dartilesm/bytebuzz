import { createLoader, createSerializer, parseAsInteger, parseAsString } from "nuqs/server";
import type { MediaData } from "@/components/lexical-editor/plugins/media/media-node";

/**
 * Media search params parsers using nuqs for type-safe query parameter handling
 */
const mediaParsers = {
  postId: parseAsString,
  id: parseAsString,
  type: parseAsString,
  alt: parseAsString,
  title: parseAsString,
  width: parseAsInteger,
  height: parseAsInteger,
} as const;

/**
 * Serializer function for media metadata
 * Converts MediaMetadata object to query string
 * Can accept base URL, URL object, or URLSearchParams as first argument
 */
const serializeMediaMetadata = createSerializer(mediaParsers);

/**
 * Loader function for media metadata
 * Extracts typed metadata from URL strings, URL objects, or URLSearchParams
 */
const loadMediaMetadata = createLoader(mediaParsers);

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
 * Uses nuqs serializer for type-safe, readable query parameters
 * Critical fields like postId are kept as top-level params for API compatibility
 *
 * @param src - The original media source URL
 * @param metadata - The metadata to encode
 * @returns The URL with metadata as readable query parameters
 */
export function encodeMediaMetadata(src: string, metadata: MediaMetadata): string {
  // Build serializable metadata object by filtering out undefined/null values
  const serializableMetadata: Record<string, string | number | null> = {};
  for (const key of Object.keys(mediaParsers) as Array<keyof typeof mediaParsers>) {
    const value = metadata[key];
    if (value !== undefined && value !== null) {
      serializableMetadata[key] = value as string | number;
    }
  }

  // Use nuqs serializer with base URL - it handles merging with existing params automatically
  return serializeMediaMetadata(src, serializableMetadata);
}

/**
 * Decodes media metadata from URL query parameters
 * Uses nuqs parsers for type-safe extraction
 * Preserves postId in URL for API route compatibility
 *
 * @param url - The URL containing encoded metadata
 * @returns An object with the decoded metadata and the cleaned source URL
 */
export function decodeMediaMetadata(url: string): {
  metadata: Partial<MediaMetadata> | null;
  src: string;
} {
  try {
    // Use nuqs loader to extract metadata - it handles URL strings, URL objects, etc.
    const loaded = loadMediaMetadata(url);

    // Filter out null/undefined values and validate type field
    const metadata: Partial<MediaMetadata> = {};
    let hasMetadata = false;

    for (const [key, value] of Object.entries(loaded)) {
      // Special validation for type field
      if (key === "type") {
        if (value === "image" || value === "video") {
          metadata.type = value;
          hasMetadata = true;
        }
      } else if (value !== null && value !== undefined) {
        metadata[key as keyof MediaMetadata] = value as never;
        hasMetadata = true;
      }
    }

    // Clean URL by removing metadata params (except postId) using serialize with null values
    const nullifiedMetadata: Record<string, string | number | null> = {};
    for (const key of Object.keys(mediaParsers) as Array<keyof typeof mediaParsers>) {
      // Keep postId if it exists in metadata, otherwise set all others to null to remove them
      if (key === "postId" && metadata.postId) {
        nullifiedMetadata.postId = metadata.postId;
      } else if (key !== "postId") {
        nullifiedMetadata[key] = null;
      }
    }

    // Use serialize to remove params (passing null removes them) while preserving postId
    const cleanSrc = serializeMediaMetadata(url, nullifiedMetadata);

    return { metadata: hasMetadata ? metadata : null, src: cleanSrc };
  } catch {
    // If URL parsing fails, return original URL with no metadata
    return { metadata: null, src: url };
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
  // Extract metadata from src URL using nuqs loader
  let extractedMetadata: Partial<MediaMetadata> = {};
  try {
    const loaded = loadMediaMetadata(mediaData.src);
    extractedMetadata = {
      postId: loaded.postId || undefined,
    };
  } catch {
    // If URL parsing fails, extractedMetadata remains empty
  }

  return {
    id: mediaData.id,
    type: mediaData.type,
    alt: mediaData.alt,
    title: mediaData.title,
    width: mediaData.width,
    height: mediaData.height,
    postId: extractedMetadata.postId,
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

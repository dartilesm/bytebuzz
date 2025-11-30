"use client";

import type { ElementTransformer } from "@lexical/markdown";
import { $createMediaNode } from "./media-node";
import { decodeMediaMetadata, metadataToMediaData } from "../../functions/media-metadata-utils";

/**
 * Custom markdown transformer for media nodes (images)
 *
 * This transformer:
 * - Parses markdown image syntax: ![alt](url)
 * - Extracts metadata from URL query parameters
 * - Creates MediaNode instances instead of default ImageNode
 * - Supports extensible metadata storage via JSON encoding
 */
export const MEDIA_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: () => {
    // Export is handled by markdown-utils.ts
    return null;
  },
  regExp: /^!\[([^\]]*)\]\(([^)]+)\)$/,
  replace: (parentNode, _children, match) => {
    const altText = match[1] || "";
    const url = match[2] || "";

    // Decode metadata from URL
    const { metadata, src } = decodeMediaMetadata(url);

    // Convert metadata to MediaData format
    const mediaData = metadataToMediaData(
      {
        ...metadata,
        // Preserve alt text from markdown if not in metadata
        alt: metadata?.alt || altText || undefined,
      },
      src,
    );

    // Create MediaNode
    const mediaNode = $createMediaNode(mediaData);
    parentNode.replace(mediaNode);
  },
  type: "element",
};

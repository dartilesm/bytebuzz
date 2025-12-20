"use client";

import type { ElementTransformer } from "@lexical/markdown";
import {
  decodeMediaMetadata,
  encodeMediaMetadata,
  mediaDataToMetadata,
  metadataToMediaData,
} from "@/components/lexical-editor/functions/media-metadata-utils";
import {
  $createMediaNode,
  $isMediaNode,
} from "@/components/lexical-editor/plugins/media/media-node";

/**
 * Custom markdown transformer for media nodes (images)
 *
 * This transformer:
 * - Parses markdown image syntax: ![alt](url)
 * - Extracts metadata from flat URL query parameters (postId, alt, type, etc.)
 * - Creates MediaNode instances instead of default ImageNode
 * - Preserves postId in URL for API route compatibility
 */
export const MEDIA_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (!$isMediaNode(node)) {
      return null;
    }

    const items = node.getItems();
    const markdownParts: string[] = [];

    for (const mediaData of items) {
      if (mediaData.type === "image") {
        // Convert to markdown image syntax with metadata encoded in URL
        const alt = mediaData.alt || mediaData.title || "Image";
        const metadata = mediaDataToMetadata(mediaData);
        const urlWithMetadata = encodeMediaMetadata(mediaData.src, metadata);
        markdownParts.push(`![${alt}](${urlWithMetadata})`);
      } else if (mediaData.type === "video") {
        // Videos don't have standard markdown syntax, so we'll use HTML
        // Include metadata in the src URL
        const metadata = mediaDataToMetadata(mediaData);
        const urlWithMetadata = encodeMediaMetadata(mediaData.src, metadata);
        markdownParts.push(
          `<video src="${urlWithMetadata}" controls${
            mediaData.title ? ` title="${mediaData.title}"` : ""
          }></video>`,
        );
      }
    }

    return markdownParts.join("\n\n");
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

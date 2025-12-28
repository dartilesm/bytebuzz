import type { ElementTransformer } from "@lexical/markdown";
import {
  $createInlineImageNode,
  $isInlineImageNode,
  InlineImageNode,
} from "@/components/lexical-editor/plugins/inline-image/inline-image-node";
import { resolveCustomEmojiUrl } from "@/lib/emojis/custom-emojis";

export const INLINE_IMAGE_TRANSFORMER: ElementTransformer = {
  dependencies: [InlineImageNode],
  export: (node) => {
    if (!$isInlineImageNode(node)) {
      return null;
    }
    // Export as ![emoji:name](id) if id exists, otherwise src
    return `![${node.__alt}](${node.__id || node.__src})`;
  },
  // Regex matches "emoji:" prefix in alt text
  regExp: /^!\[(emoji:[^\]]*)\]\(([^)]+)\)$/,
  replace: (parentNode, _children, match) => {
    const alt = match[1];
    const srcOrId = match[2];

    // Try to resolve as custom emoji ID
    const resolvedUrl = resolveCustomEmojiUrl(srcOrId);

    // If resolved, use the resolved URL as src, and srcOrId as id
    // If not resolved, assume it's a direct URL (fallback)
    const src = resolvedUrl || srcOrId;
    const id = resolvedUrl ? srcOrId : undefined;

    const mediaNode = $createInlineImageNode({
      alt,
      src,
      id,
    });
    parentNode.replace(mediaNode);
  },
  type: "element",
};

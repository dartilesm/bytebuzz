import type { ElementTransformer } from "@lexical/markdown";
import {
  $createInlineImageNode,
  $isInlineImageNode,
  InlineImageNode,
} from "@/components/lexical-editor/plugins/inline-image/inline-image-node";

export const INLINE_IMAGE_TRANSFORMER: ElementTransformer = {
  dependencies: [InlineImageNode],
  export: (node) => {
    if (!$isInlineImageNode(node)) {
      return null;
    }
    // Export as ![emoji:name](url)
    return `![${node.__alt}](${node.__src})`;
  },
  // Regex that strictly matches "emoji:" prefix in alt text
  regExp: /^!\[(emoji:[^\]]*)\]\(([^)]+)\)$/,
  replace: (parentNode, _children, match) => {
    const alt = match[1];
    const src = match[2];

    const mediaNode = $createInlineImageNode({
      alt,
      src,
    });
    parentNode.replace(mediaNode);
  },
  type: "element",
};

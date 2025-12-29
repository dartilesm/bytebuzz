import type { ElementTransformer } from "@lexical/markdown";
import { EMOJI_ENDPOINT } from "@/components/lexical-editor/consts/emoji";
import { getCustomEmojiUrl } from "@/components/lexical-editor/functions/insert-emoji";
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
    // Export as ![emoji:name](id) if id exists, otherwise src
    return `![${node.__alt}](${node.__id || node.__src})`;
  },
  // Regex matches "emoji:" prefix in alt text
  regExp: /^!\[(emoji:[^\]]*)\]\(([^)]+)\)$/,
  replace: (parentNode, _children, match) => {
    const alt = match[1];
    const srcOrId = match[2];

    let src = srcOrId;
    let id: string | undefined = undefined;

    // Check if it's likely an ID (no scheme/path)
    if (!srcOrId.startsWith("http") && !srcOrId.startsWith("/")) {
      id = srcOrId;
      src = getCustomEmojiUrl(id);
    } else if (srcOrId.startsWith(EMOJI_ENDPOINT)) {
      // It's already an API path, extract ID
      id = srcOrId.replace(`${EMOJI_ENDPOINT}/`, "");
    }

    const mediaNode = $createInlineImageNode({
      alt,
      src,
      id,
    });
    parentNode.replace(mediaNode);
  },
  type: "element",
};

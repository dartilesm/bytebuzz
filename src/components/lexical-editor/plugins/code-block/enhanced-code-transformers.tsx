"use client";

import type { ElementTransformer } from "@lexical/markdown";
import {
  $createEnhancedCodeBlockNode,
  $isEnhancedCodeBlockNode,
} from "@/components/lexical-editor/plugins/code-block/enhanced-code-block-node";

/**
 * Custom markdown transformer for enhanced code blocks
 *
 * This replaces the default code block transformer to use our enhanced code editor
 */
export const ENHANCED_CODE_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (!$isEnhancedCodeBlockNode(node)) {
      return null;
    }

    const language = node.getLanguage();
    const code = node.getCode();
    const metadata = node.getMetadata();

    if (metadata) {
      return `\`\`\`${language} ${metadata}\n${code}\n\`\`\``;
    }

    return `\`\`\`${language}\n${code}\n\`\`\``;
  },
  regExp: /^```(\S+)?(?:\s+(.*))?$/,
  replace: (parentNode, children, match) => {
    const language = match[1] || "plaintext";
    const metadata = match[2] || "";

    // Extract code from children (text nodes)
    let code = "";
    if (children && children.length > 0) {
      code = children.map((child) => child.getTextContent()).join("\n");
    }

    const codeBlockNode = $createEnhancedCodeBlockNode(language, code, metadata);
    parentNode.replace(codeBlockNode);
  },
  type: "element",
};

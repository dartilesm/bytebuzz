"use client";

import type { ElementTransformer } from "@lexical/markdown";
import { $createEnhancedCodeBlockNode, $isEnhancedCodeBlockNode } from "./enhanced-code-block-node";

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

    return `\`\`\`${language}\n${code}\n\`\`\``;
  },
  regExp: /^```(\w+)?(?:\s*)$/,
  replace: (parentNode, _children, match) => {
    const language = match[1] || "plaintext";
    const codeBlockNode = $createEnhancedCodeBlockNode(language);
    parentNode.replace(codeBlockNode);
  },
  type: "element",
};

"use client";

import type { LexicalExportVisitor } from "@mdxeditor/editor";
import { $isLinkNode, type LinkNode } from "./link-node";

/**
 * Export visitor for converting Lexical link nodes to markdown
 */
// biome-ignore lint/suspicious/noExplicitAny: MDXEditor API requires any type
export const LinkVisitor: LexicalExportVisitor<LinkNode, any> = {
  testLexicalNode: $isLinkNode,
  visitLexicalNode: ({ lexicalNode }) => {
    const linkData = lexicalNode.getLinkData();

    // If text is different from URL, use markdown link format [text](url)
    // Otherwise, just return the URL
    if (linkData.text && linkData.text !== linkData.url) {
      return `[${linkData.text}](${linkData.url})`;
    }

    return linkData.url;
  },
};

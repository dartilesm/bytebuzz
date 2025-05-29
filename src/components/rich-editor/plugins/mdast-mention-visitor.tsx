"use client";

import type { MdastImportVisitor } from "@mdxeditor/editor";

/**
 * Import visitor for converting markdown text with mentions to Lexical mention nodes
 */
// biome-ignore lint/suspicious/noExplicitAny: MDXEditor API requires any type
export const MdastMentionVisitor: MdastImportVisitor<any> = {
  testNode: (node) => {
    return node.type === "text" && typeof node.value === "string" && node.value.includes("@");
  },
  visitNode: ({ mdastNode }) => {
    const text = mdastNode.value as string;

    // For now, just return the text as-is
    // In a real implementation, you'd parse mentions and create mention nodes
    return text;
  },
};

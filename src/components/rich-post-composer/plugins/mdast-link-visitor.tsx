"use client";

import type { MdastImportVisitor } from "@mdxeditor/editor";

/**
 * Import visitor for converting markdown links to Lexical link nodes
 */
// biome-ignore lint/suspicious/noExplicitAny: MDXEditor API requires any type
export const MdastLinkVisitor: MdastImportVisitor<any> = {
  testNode: (node) => {
    return node.type === "link";
  },
  visitNode: ({ mdastNode }) => {
    const url = mdastNode.url as string;
    const children = mdastNode.children || [];

    // Get the text content from children if available
    let text = "";
    if (children.length > 0 && children[0].type === "text") {
      text = children[0].value as string;
    }

    // For now, just return the URL as text - we'll handle link conversion in the plugin
    return text || url;
  },
};

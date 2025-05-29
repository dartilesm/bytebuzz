"use client";

import type { LexicalExportVisitor } from "@mdxeditor/editor";
import { $isMentionNode, type MentionNode } from "./mention-node";

/**
 * Export visitor for converting Lexical mention nodes to markdown
 */
// biome-ignore lint/suspicious/noExplicitAny: MDXEditor API requires any type
export const MentionVisitor: LexicalExportVisitor<MentionNode, any> = {
  testLexicalNode: $isMentionNode,
  visitLexicalNode: ({ lexicalNode }) => {
    const user = lexicalNode.getUser();
    return `@${user.displayName}`;
  },
};

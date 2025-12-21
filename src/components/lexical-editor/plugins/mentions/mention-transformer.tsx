"use client";

import type { TextMatchTransformer } from "@lexical/markdown";
import {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
} from "@/components/lexical-editor/plugins/mentions/mention-node";

/**
 * Custom markdown transformer for mentions
 *
 * Syntax: @[display_name](mention:id:username:avatarUrl)
 */
export const MENTION_TRANSFORMER: TextMatchTransformer = {
  dependencies: [MentionNode],
  export: (node) => {
    if (!$isMentionNode(node)) {
      return null;
    }
    const user = node.getUser();
    return `[@${user.displayName}](/mention:${user.id}:${user.username})`;
  },
  importRegExp: /@\[([^\]]+)\]\(mention:([^:]+):([^:]+)(?::([^)]+))?\)/,
  regExp: /@\[([^\]]+)\]\(mention:([^:]+):([^:]+)(?::([^)]+))?\)$/,
  replace: (textNode, match) => {
    const [, displayName, id, username, avatarUrl] = match;
    const user = {
      id,
      username,
      displayName,
      avatarUrl,
    };
    const mentionNode = $createMentionNode(user);
    textNode.replace(mentionNode);
  },
  trigger: ")",
  type: "text-match",
};

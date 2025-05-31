import { $getRoot, type EditorState } from "lexical";
import { $isHeadingNode, type HeadingNode } from "@lexical/rich-text";
import { $isListNode, $isListItemNode, type ListNode, type ListItemNode } from "@lexical/list";
import { $isCodeNode, type CodeNode } from "@lexical/code";
import { $isQuoteNode, type QuoteNode } from "@lexical/rich-text";
import { $isLinkNode, type LinkNode } from "@lexical/link";

/**
 * Converts Lexical editor state to markdown string
 */
export function editorStateToMarkdown(editorState: EditorState): string {
  let markdown = "";

  editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    for (const child of children) {
      markdown += nodeToMarkdown(child) + "\n";
    }
  });

  return markdown.trim();
}

/**
 * Converts a single Lexical node to markdown
 */
function nodeToMarkdown(node: any): string {
  if ($isHeadingNode(node)) {
    const heading = node as HeadingNode;
    const level = heading.getTag().slice(1); // Extract number from h1, h2, etc.
    const hashes = "#".repeat(Number(level));
    return `${hashes} ${heading.getTextContent()}`;
  }

  if ($isListNode(node)) {
    const list = node as ListNode;
    const listType = list.getListType();
    const children = list.getChildren();

    return children
      .map((child, index) => {
        if ($isListItemNode(child)) {
          const listItem = child as ListItemNode;
          const prefix = listType === "bullet" ? "-" : `${index + 1}.`;
          return `${prefix} ${listItem.getTextContent()}`;
        }
        return "";
      })
      .join("\n");
  }

  if ($isCodeNode(node)) {
    const code = node as CodeNode;
    return `\`\`\`\n${code.getTextContent()}\n\`\`\``;
  }

  if ($isQuoteNode(node)) {
    const quote = node as QuoteNode;
    return `> ${quote.getTextContent()}`;
  }

  if ($isLinkNode(node)) {
    const link = node as LinkNode;
    return `[${link.getTextContent()}](${link.getURL()})`;
  }

  // Handle text formatting
  const textContent = node.getTextContent();
  if (!textContent) return "";

  // Check for text formatting
  if (node.hasFormat && typeof node.hasFormat === "function") {
    let formatted = textContent;

    if (node.hasFormat("bold")) {
      formatted = `**${formatted}**`;
    }

    if (node.hasFormat("italic")) {
      formatted = `*${formatted}*`;
    }

    if (node.hasFormat("strikethrough")) {
      formatted = `~~${formatted}~~`;
    }

    if (node.hasFormat("code")) {
      formatted = `\`${formatted}\``;
    }

    return formatted;
  }

  return textContent;
}

/**
 * Converts markdown string to Lexical editor state
 * This is a simplified implementation - for production use, consider using @lexical/markdown
 */
export function markdownToEditorState(markdown: string): any {
  // TODO: Implement proper markdown to editor state conversion
  // For now, return null to use the default empty state
  return null;
}

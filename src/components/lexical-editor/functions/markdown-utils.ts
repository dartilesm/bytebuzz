import {
  $getRoot,
  type EditorState,
  type LexicalNode,
  type TextNode,
  type ElementNode,
} from "lexical";
import { $isEnhancedCodeBlockNode } from "../plugins/code-block/enhanced-code-block-node";
import { $isMediaNode } from "../plugins/media/media-node";
import { $isHeadingNode, $isQuoteNode, type HeadingNode } from "@lexical/rich-text";
import { $isListNode, $isListItemNode, type ListNode, type ListItemNode } from "@lexical/list";
import { $isCodeNode, type CodeNode } from "@lexical/code";
import { $isLinkNode, type LinkNode } from "@lexical/link";
import { encodeMediaMetadata, mediaDataToMetadata } from "./media-metadata-utils";

/**
 * Converts the current editor state to markdown string
 */
export function editorStateToMarkdown(editorState: EditorState): string {
  return editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    const markdownParts: string[] = [];

    for (const child of children) {
      const markdown = nodeToMarkdown(child);
      if (markdown.trim()) {
        markdownParts.push(markdown);
      }
    }

    return markdownParts.join("\n\n");
  });
}

/**
 * Converts a single Lexical node to its markdown representation
 */
function nodeToMarkdown(node: LexicalNode): string {
  // Enhanced code blocks
  if ($isEnhancedCodeBlockNode(node)) {
    const language = node.getLanguage();
    const code = node.getCode();
    const metadata = node.getMetadata();

    if (metadata) {
      return `\`\`\`${language} ${metadata}\n${code}\n\`\`\``;
    }

    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  // Media nodes (images and videos)
  if ($isMediaNode(node)) {
    const items = node.getItems();
    const markdownParts: string[] = [];

    for (const mediaData of items) {
      if (mediaData.type === "image") {
        // Convert to markdown image syntax with metadata encoded in URL
        const alt = mediaData.alt || mediaData.title || "Image";
        const metadata = mediaDataToMetadata(mediaData);
        const urlWithMetadata = encodeMediaMetadata(mediaData.src, metadata);
        markdownParts.push(`![${alt}](${urlWithMetadata})`);
      } else if (mediaData.type === "video") {
        // Videos don't have standard markdown syntax, so we'll use HTML
        // Include metadata in the src URL
        const metadata = mediaDataToMetadata(mediaData);
        const urlWithMetadata = encodeMediaMetadata(mediaData.src, metadata);
        markdownParts.push(
          `<video src="${urlWithMetadata}" controls${
            mediaData.title ? ` title="${mediaData.title}"` : ""
          }></video>`,
        );
      }
    }

    return markdownParts.join("\n\n");
  }

  // Headings
  if ($isHeadingNode(node)) {
    const headingNode = node as HeadingNode;
    const level = headingNode.getTag().slice(1); // Extract number from h1, h2, etc.
    const hashes = "#".repeat(Number(level));
    const textContent = getTextContentWithFormatting(headingNode);
    return `${hashes} ${textContent}`;
  }

  // Quotes
  if ($isQuoteNode(node)) {
    const textContent = getTextContentWithFormatting(node);
    return `> ${textContent}`;
  }

  // Lists
  if ($isListNode(node)) {
    const listNode = node as ListNode;
    const listType = listNode.getListType();
    const children = listNode.getChildren();

    return children
      .map((child, index) => {
        if ($isListItemNode(child)) {
          const listItem = child as ListItemNode;
          const prefix = listType === "bullet" ? "-" : `${index + 1}.`;
          const textContent = getTextContentWithFormatting(listItem);
          return `${prefix} ${textContent}`;
        }
        return "";
      })
      .filter((item) => item.trim())
      .join("\n");
  }

  // Code blocks (basic)
  if ($isCodeNode(node)) {
    const codeNode = node as CodeNode;
    const language = codeNode.getLanguage() || "";
    const code = codeNode.getTextContent();
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  // Regular paragraphs and other text nodes
  return getTextContentWithFormatting(node);
}

/**
 * Gets text content from a node while preserving text formatting (bold, italic, etc.)
 */
function getTextContentWithFormatting(node: LexicalNode): string {
  // Check if node has children (ElementNode)
  if ("getChildren" in node && typeof node.getChildren === "function") {
    const elementNode = node as ElementNode;
    const children = elementNode.getChildren();

    if (children.length === 0) {
      return node.getTextContent();
    }

    return children
      .map((child: LexicalNode) => {
        if ($isLinkNode(child)) {
          const linkNode = child as LinkNode;
          const text = getTextContentWithFormatting(linkNode);
          const url = linkNode.getURL();

          // If the link text is the same as the URL, format as [url](url)
          // Otherwise use the standard [text](url) format
          if (text === url || text.trim() === url.trim()) {
            return `[${url}](${url})`;
          }

          return `[${text}](${url})`;
        }

        // Handle text nodes with formatting
        if (child.getType() === "text") {
          const textNode = child as TextNode;
          let text = textNode.getTextContent();

          if (textNode.hasFormat("code")) {
            text = `\`${text}\``;
          }

          if (textNode.hasFormat("bold")) {
            text = `**${text}**`;
          }

          if (textNode.hasFormat("italic")) {
            text = `*${text}*`;
          }

          if (textNode.hasFormat("strikethrough")) {
            text = `~~${text}~~`;
          }

          return text;
        }

        // For other node types, get their text content with formatting
        return getTextContentWithFormatting(child);
      })
      .join("");
  }

  // If node doesn't have children, just return text content
  return node.getTextContent();
}

/**
 * Placeholder function for converting markdown to editor state
 * This would be used for importing markdown content
 */
export function markdownToEditorState(markdown: string): string {
  // This is a placeholder - would need proper markdown parsing
  return markdown;
}

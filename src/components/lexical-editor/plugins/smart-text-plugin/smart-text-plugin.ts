"use client";

import { $createLinkNode, $isLinkNode, type LinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_SPACE_COMMAND,
  type TextNode,
} from "lexical";
import { useEffect } from "react";

/**
 * Checks if a given text contains a valid URL
 */
function isValidURL(text: string): { isValid: boolean; url: string } {
  try {
    // Try to create URL directly
    const url = new URL(text);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return { isValid: true, url: url.href };
    }
  } catch {
    // If it fails, try with https:// prefix for www. or domain-like strings
    if (text.includes(".") && !text.includes(" ")) {
      try {
        const url = new URL(`https://${text}`);
        if (url.protocol === "https:") {
          return { isValid: true, url: url.href };
        }
      } catch {
        // Still not valid
      }
    }
  }
  return { isValid: false, url: text };
}

/**
 * Checks if a text node is inside an inline code context
 */
function isInsideInlineCode(node: TextNode): boolean {
  return node.hasFormat("code");
}

/**
 * Processes text content to handle inline code formatting and smart linking
 */
function processTextContent(node: TextNode): void {
  const textContent = node.getTextContent();

  // Skip if already processed or is a link
  if (node.hasFormat("code") || $isLinkNode(node.getParent())) {
    return;
  }

  // Check for inline code pattern: `code here`
  const inlineCodeMatch = textContent.match(/`([^`]+)`/);
  if (inlineCodeMatch) {
    const beforeCode = textContent.substring(0, inlineCodeMatch.index);
    const codeContent = inlineCodeMatch[1];
    const afterCode = textContent.substring(
      (inlineCodeMatch.index ?? 0) + inlineCodeMatch[0].length,
    );

    // Create text nodes for before and after
    const beforeNode = beforeCode ? $createTextNode(beforeCode) : null;
    const afterNode = afterCode ? $createTextNode(afterCode) : null;

    // Create inline code node
    const codeNode = $createTextNode(codeContent);
    codeNode.setFormat("code");

    // Replace the original node with the new nodes
    if (beforeNode) {
      node.insertBefore(beforeNode);
    }
    node.insertBefore(codeNode);
    if (afterNode) {
      node.insertBefore(afterNode);
    }
    node.remove();

    // Process the remaining text nodes for more patterns
    if (beforeNode) {
      processTextContent(beforeNode);
    }
    if (afterNode) {
      processTextContent(afterNode);
    }
    return;
  }

  // Check for URLs only if not inside inline code
  if (!isInsideInlineCode(node)) {
    const words = textContent.split(/\s+/);
    let hasLinks = false;

    for (const word of words) {
      const { isValid } = isValidURL(word);
      if (isValid) {
        hasLinks = true;
        break;
      }
    }

    if (hasLinks) {
      // Process the text to create link nodes
      const parts = textContent.split(/(\s+)/); // Split by whitespace, keeping the whitespace
      const newNodes: (TextNode | LinkNode)[] = [];

      for (const part of parts) {
        if (part.trim()) {
          const { isValid, url } = isValidURL(part.trim());
          if (isValid) {
            // Create link node
            const linkNode = $createLinkNode(url);
            const linkText = $createTextNode(part.trim());
            linkNode.append(linkText);
            newNodes.push(linkNode);
          } else {
            newNodes.push($createTextNode(part));
          }
        } else {
          // Whitespace
          newNodes.push($createTextNode(part));
        }
      }

      // Replace the original node with new nodes
      for (const newNode of newNodes) {
        node.insertBefore(newNode);
      }
      node.remove();
    }
  }
}

/**
 * Plugin that handles smart text formatting including inline code and link detection
 *
 * Features:
 * - Converts `text` to inline code formatting
 * - Auto-detects and converts URLs to links
 * - Prevents URL conversion inside inline code blocks
 */
export function SmartTextPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    /**
     * Handles space key press to trigger text processing
     */
    function handleSpaceKey(): boolean {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false;
      }

      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();

      if (!$isTextNode(anchorNode)) {
        return false;
      }

      // Process the current text node
      processTextContent(anchorNode);

      return false; // Allow normal space handling
    }

    return editor.registerCommand(KEY_SPACE_COMMAND, handleSpaceKey, COMMAND_PRIORITY_LOW);
  }, [editor]);

  return null;
}

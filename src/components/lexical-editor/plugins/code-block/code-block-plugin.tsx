"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import type { TextNode } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_SPACE_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";
import { useEffect } from "react";
import { $createEnhancedCodeBlockNode } from "@/components/lexical-editor/plugins/code-block/enhanced-code-block-node";

interface CodeBlockPluginProps {
  /**
   * Supported programming languages for syntax highlighting
   */
  supportedLanguages?: string[];
}

/**
 * Default supported languages for code blocks
 */
const DEFAULT_LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "scala",
  "html",
  "css",
  "scss",
  "sass",
  "less",
  "json",
  "xml",
  "yaml",
  "sql",
  "bash",
  "shell",
  "powershell",
  "dockerfile",
  "markdown",
  "plaintext",
  "text",
];

/**
 * Plugin that handles enhanced code block creation with language specification
 *
 * Features:
 * - Detects ```lang patterns
 * - Converts to enhanced code blocks on Tab or Space
 * - Uses the sophisticated CodeBlockEditor component
 * - Monaco Editor integration with syntax highlighting
 */
export function CodeBlockPlugin({
  supportedLanguages = DEFAULT_LANGUAGES,
}: CodeBlockPluginProps = {}) {
  const [editor] = useLexicalComposerContext();

  /**
   * Detects if current cursor position has a code block pattern
   */
  function detectCodeBlockPattern(): {
    hasPattern: boolean;
    language: string;
    node: TextNode | null;
    matchStart: number;
  } {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return { hasPattern: false, language: "", node: null, matchStart: 0 };
    }

    const anchor = selection.anchor;
    const node = anchor.getNode();

    if (node && "getTextContent" in node) {
      const textNode = node as TextNode;
      const text = textNode.getTextContent();
      const offset = anchor.offset;

      // Find code block pattern: ```language
      const beforeCursor = text.slice(0, offset);
      const codeBlockMatch = beforeCursor.match(/```(\w+)$/);

      if (codeBlockMatch) {
        const language = codeBlockMatch[1].toLowerCase();

        // Check if language is supported
        if (supportedLanguages.includes(language)) {
          return {
            hasPattern: true,
            language,
            node: textNode,
            matchStart: beforeCursor.length - codeBlockMatch[0].length,
          };
        }
      }
    }

    return { hasPattern: false, language: "", node: null, matchStart: 0 };
  }

  /**
   * Converts the detected pattern to an enhanced code block
   */
  function convertToEnhancedCodeBlock(language: string, textNode: TextNode, matchStart: number) {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Select the ```language text
      const currentOffset = selection.anchor.offset;
      textNode.select(matchStart, currentOffset);

      // Create and insert the enhanced code block
      const codeBlockNode = $createEnhancedCodeBlockNode(language);
      selection.insertNodes([codeBlockNode]);

      // Add some space after the code block
      selection.insertParagraph();
    });
  }

  /**
   * Handles Tab key to convert code block pattern
   */
  function handleTabKey(): boolean {
    const pattern = editor.getEditorState().read(detectCodeBlockPattern);

    if (pattern.hasPattern && pattern.node) {
      convertToEnhancedCodeBlock(pattern.language, pattern.node, pattern.matchStart);
      return true; // Prevent default tab behavior
    }

    return false; // Allow default tab behavior
  }

  /**
   * Handles Space key to convert code block pattern
   */
  function handleSpaceKey(): boolean {
    const pattern = editor.getEditorState().read(detectCodeBlockPattern);

    if (pattern.hasPattern && pattern.node) {
      convertToEnhancedCodeBlock(pattern.language, pattern.node, pattern.matchStart);
      return true; // Prevent default space insertion
    }

    return false; // Allow default space behavior
  }

  useEffect(() => {
    return mergeRegister(
      // Handle Tab key
      editor.registerCommand(
        KEY_TAB_COMMAND,
        () => {
          // Only handle if not in a code block already
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode();
            // Don't interfere if already in a code block
            if (node.getType() === "code" || node.getType() === "enhanced-code-block") {
              return false;
            }
          }

          return handleTabKey();
        },
        COMMAND_PRIORITY_NORMAL,
      ),

      // Handle Space key
      editor.registerCommand(
        KEY_SPACE_COMMAND,
        () => {
          // Only handle if not in a code block already
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode();
            // Don't interfere if already in a code block
            if (node.getType() === "code" || node.getType() === "enhanced-code-block") {
              return false;
            }
          }

          return handleSpaceKey();
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    );
  }, [editor, supportedLanguages]);

  return null;
}

/**
 * Hook to get list of supported languages
 */
export function useSupportedLanguages(): string[] {
  return DEFAULT_LANGUAGES;
}

"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_TAB_COMMAND,
  KEY_SPACE_COMMAND,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { $createCodeNode } from "@lexical/code";
import type { TextNode } from "lexical";

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
 * Plugin that handles code block creation with language specification
 *
 * Features:
 * - Detects ```lang patterns
 * - Converts to code blocks on Tab or Space
 * - Supports multiple programming languages
 * - Syntax highlighting ready
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
   * Converts the detected pattern to a code block
   */
  function convertToCodeBlock(language: string, textNode: TextNode, matchStart: number) {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Select the ```language text
      const currentOffset = selection.anchor.offset;
      textNode.select(matchStart, currentOffset);

      // Create and insert the code block
      const codeNode = $createCodeNode(language);
      selection.insertNodes([codeNode]);

      // Focus the code block for immediate editing
      codeNode.select();
    });
  }

  /**
   * Handles Tab key to convert code block pattern
   */
  function handleTabKey(): boolean {
    const pattern = editor.getEditorState().read(detectCodeBlockPattern);

    if (pattern.hasPattern && pattern.node) {
      convertToCodeBlock(pattern.language, pattern.node, pattern.matchStart);
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
      convertToCodeBlock(pattern.language, pattern.node, pattern.matchStart);
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
            if (node.getType() === "code") {
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
            if (node.getType() === "code") {
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

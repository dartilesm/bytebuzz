"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

interface ValuePluginProps {
  /**
   * Plain text value to set in the editor
   */
  value?: string;
  /**
   * Markdown value to parse and set in the editor
   */
  markdownValue?: string;
}

/**
 * Plugin to handle setting initial value and value updates
 *
 * Supports both plain text (value) and markdown (markdownValue) content.
 * markdownValue takes priority when both are provided.
 */
export function ValuePlugin({ value, markdownValue }: ValuePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Prioritize markdownValue over value
    const contentToSet = markdownValue ?? value;

    if (contentToSet !== undefined) {
      editor.update(() => {
        const root = $getRoot();

        // Clear existing content
        root.clear();

        if (contentToSet.trim()) {
          if (markdownValue) {
            // Use Lexical's built-in markdown parser
            $convertFromMarkdownString(markdownValue, TRANSFORMERS);
          } else {
            // Handle plain text content
            const lines = contentToSet.split("\n");

            lines.forEach((line, index) => {
              const paragraph = $createParagraphNode();
              const textNode = $createTextNode(line);
              paragraph.append(textNode);
              root.append(paragraph);

              // Add line break between paragraphs except for the last one
              if (index < lines.length - 1 && line.trim()) {
                root.append($createParagraphNode());
              }
            });
          }
        }
      });
    }
  }, [editor, value, markdownValue]);

  return null;
}

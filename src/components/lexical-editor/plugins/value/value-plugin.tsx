"use client";

import { $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { useEffect } from "react";
import { customTransformers } from "@/components/lexical-editor/markdown-config";

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
 *
 * The plugin respects the centralized markdown configuration and only processes
 * markdown patterns that are enabled in MARKDOWN_FEATURES.
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
            // Use filtered transformers that respect centralized config
            $convertFromMarkdownString(markdownValue, customTransformers);
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

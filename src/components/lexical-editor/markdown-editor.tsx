"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { cn } from "@/lib/utils";
import { useEffect, type RefObject } from "react";
import type { EditorState, LexicalEditor } from "lexical";
import { editorStateToMarkdown } from "./functions/markdown-utils";

// Import mention components
import { MentionPlugin } from "./plugins/mentions/mention-plugin";
import { ENHANCED_CODE_BLOCK_TRANSFORMER } from "./plugins/code-block/enhanced-code-transformers";
import { useMarkdownContext } from "./markdown-provider";

// Create custom transformers that use our enhanced code block
const customTransformers = TRANSFORMERS.filter(
  (transformer) =>
    !(
      transformer.type === "element" &&
      "regExp" in transformer &&
      transformer.regExp?.source.includes("```")
    ),
).concat([ENHANCED_CODE_BLOCK_TRANSFORMER]);

// URL detection matchers for AutoLinkPlugin using native URL constructor
const MATCHERS = [
  (text: string) => {
    // Look for potential URLs in the text
    const words = text.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let url: URL | null = null;

      // Try to create URL directly
      try {
        url = new URL(word);
      } catch {
        // If it fails, try with https:// prefix for www. or domain-like strings
        if (word.includes(".") && !word.includes(" ")) {
          try {
            url = new URL(`https://${word}`);
          } catch {
            continue;
          }
        } else {
          continue;
        }
      }

      // Only accept http, https protocols (not file:, data:, etc.)
      if (url && (url.protocol === "http:" || url.protocol === "https:")) {
        const startIndex = text.indexOf(word);
        if (startIndex !== -1) {
          return {
            index: startIndex,
            length: word.length,
            text: word,
            url: url.href,
          };
        }
      }
    }

    return null;
  },
];

interface MarkdownEditorProps {
  /**
   * Placeholder text to show when editor is empty
   */
  placeholder?: string;
  /**
   * Additional CSS classes for the content editable area
   */
  contentClassName?: string;
  /**
   * Additional CSS classes for the editor container
   */
  className?: string;
  /**
   * Whether to auto-focus the editor on mount
   */
  autoFocus?: boolean;
}

/**
 * Plugin to handle editor state changes and convert to markdown
 */
function OnChangeMarkdownPlugin({
  onChange,
}: { onChange?: (markdown: string, editorState: EditorState) => void }) {
  function handleEditorChange(editorState: EditorState) {
    if (!onChange) return;

    const markdown = editorStateToMarkdown(editorState);
    onChange(markdown, editorState);
  }

  return <OnChangePlugin onChange={handleEditorChange} />;
}

/**
 * Plugin to set editor reference
 */
function EditorRefPlugin({ editorRef }: { editorRef?: RefObject<LexicalEditor> }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editorRef && "current" in editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  return null;
}

/**
 * Custom placeholder component
 */
function Placeholder({ children }: { children: string }) {
  return (
    <div className="absolute top-0 left-0 text-default-400 pointer-events-none select-none">
      {children}
    </div>
  );
}

/**
 * Lexical-based markdown editor with keyboard shortcuts and mentions
 *
 * Must be used within a MarkdownProvider
 *
 * Features:
 * - Markdown shortcuts (# for headings, ** for bold, etc.)
 * - Mentions triggered by "@" symbol (if enabled in provider)
 * - Real-time markdown conversion
 * - Extensible plugin architecture
 */
export function MarkdownEditor({
  placeholder = "What's on your mind?",
  contentClassName,
  className,
  autoFocus = false,
}: MarkdownEditorProps) {
  const { enableMentions, onChange, editorRef } = useMarkdownContext();

  return (
    <div className={cn("relative", className)}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={cn("outline-none min-h-[100px] resize-none", contentClassName)}
          />
        }
        placeholder={<Placeholder>{placeholder}</Placeholder>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/* Core plugins */}
      <HistoryPlugin />
      {autoFocus && <AutoFocusPlugin />}

      {/* Markdown shortcuts plugin */}
      <MarkdownShortcutPlugin transformers={customTransformers} />

      {/* Auto link plugin for URL detection */}
      <AutoLinkPlugin matchers={MATCHERS} />

      {/* Mention plugin */}
      {enableMentions && <MentionPlugin />}

      {/* Event handling plugins */}
      <OnChangeMarkdownPlugin onChange={onChange} />
      {editorRef && <EditorRefPlugin editorRef={editorRef} />}
    </div>
  );
}

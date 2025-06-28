"use client";

import { cn } from "@/lib/utils";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { EditorState, LexicalEditor } from "lexical";
import { type RefObject, useEffect } from "react";
import { editorStateToMarkdown } from "./functions/markdown-utils";

import { customTransformers } from "./markdown-config";
import { useMarkdownContext } from "./markdown-provider";

import { MentionPlugin } from "./plugins/mentions/mention-plugin";
import { ValuePlugin } from "./plugins/value/value-plugin";
import { SmartTextPlugin } from "@/components/lexical-editor/plugins/smart-text-plugin/smart-text-plugin";

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
  /**
   * Initial plain text value to display in the editor
   */
  value?: string;
  /**
   * Initial markdown value to parse and display in the editor
   */
  markdownValue?: string;
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
  value,
  markdownValue,
}: MarkdownEditorProps) {
  const { enableMentions, onChange, editorRef } = useMarkdownContext();

  return (
    <div className={cn("relative", className)}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={cn("outline-none min-h-[100px] resize-none cursor-text", contentClassName)}
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
      <SmartTextPlugin />

      {/* Mention plugin */}
      {enableMentions && <MentionPlugin />}

      {/* Event handling plugins */}
      <OnChangeMarkdownPlugin onChange={onChange} />
      {editorRef && <EditorRefPlugin editorRef={editorRef} />}
      <ValuePlugin value={value} markdownValue={markdownValue} />
    </div>
  );
}

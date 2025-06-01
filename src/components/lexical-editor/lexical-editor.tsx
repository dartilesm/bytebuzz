"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { cn } from "@/lib/utils";
import { useEffect, type RefObject } from "react";
import type { EditorState, LexicalEditor } from "lexical";
import { editorStateToMarkdown } from "./functions/markdown-utils";

// Import mention components
import { MentionNode } from "./plugins/mentions/mention-node";
import { MentionPlugin } from "./plugins/mentions/mention-plugin";
import { EnhancedCodeBlockNode } from "./plugins/code-block/enhanced-code-block-node";
import { ENHANCED_CODE_BLOCK_TRANSFORMER } from "./plugins/code-block/enhanced-code-transformers";
import { MediaNode } from "./plugins/media/media-node";
import { EditorToolbar } from "./plugins/toolbar/editor-toolbar";

// Editor theme
const theme = {
  paragraph: "mb-1",
  heading: {
    h1: "text-2xl font-bold mb-2",
    h2: "text-xl font-bold mb-2",
    h3: "text-lg font-bold mb-1",
    h4: "text-base font-bold mb-1",
    h5: "text-sm font-bold mb-1",
    h6: "text-xs font-bold mb-1",
  },
  list: {
    ul: "list-disc pl-4 mb-2",
    ol: "list-decimal pl-4 mb-2",
    listitem: "mb-1",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline",
    code: "bg-gray-100 rounded px-1 font-mono text-sm",
  },
  code: "bg-gray-100 rounded p-2 font-mono text-sm block mb-2",
  quote: "border-l-4 border-gray-300 pl-4 italic mb-2",
  link: "text-blue-500 underline hover:text-blue-700",
  mention:
    "bg-primary-100 text-primary-800 rounded px-1 py-0.5 font-medium cursor-pointer hover:bg-primary-200",
};

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
   * Callback when content changes
   */
  onChange?: (markdown: string, editorState: EditorState) => void;
  /**
   * Additional CSS classes for the editor container
   */
  className?: string;
  /**
   * Additional CSS classes for the content editable area
   */
  contentClassName?: string;
  /**
   * Reference to the editor instance
   */
  editorRef?: RefObject<LexicalEditor>;
  /**
   * Whether to auto-focus the editor on mount
   */
  autoFocus?: boolean;
  /**
   * Whether to enable mentions functionality
   */
  enableMentions?: boolean;
  /**
   * Whether to show the bottom toolbar
   */
  showToolbar?: boolean;
}

/**
 * Plugin to handle editor state changes and convert to markdown
 */
function OnChangeMarkdownPlugin({ onChange }: { onChange?: MarkdownEditorProps["onChange"] }) {
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
    <div className="absolute top-3 left-3 text-default-400 pointer-events-none select-none">
      {children}
    </div>
  );
}

/**
 * Lexical-based markdown editor with keyboard shortcuts and mentions
 *
 * Features:
 * - Markdown shortcuts (# for headings, ** for bold, etc.)
 * - Mentions triggered by "@" symbol (optional)
 * - No toolbar - pure markdown experience
 * - Real-time markdown conversion
 * - Extensible plugin architecture
 */
export function MarkdownEditor({
  placeholder = "What's on your mind?",
  onChange,
  className,
  contentClassName,
  editorRef,
  autoFocus = false,
  enableMentions = true,
  showToolbar = true,
}: MarkdownEditorProps) {
  const initialConfig = {
    namespace: "lexical-markdown-editor",
    theme,
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      EnhancedCodeBlockNode,
      ...(enableMentions ? [MentionNode] : []),
      MediaNode,
    ],
    editorState: undefined,
  };

  return (
    <div className={cn("relative", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  "outline-none min-h-[100px] p-3 resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  contentClassName,
                )}
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

          {/* Editor Toolbar */}
          {showToolbar && <EditorToolbar />}
        </div>
      </LexicalComposer>
    </div>
  );
}

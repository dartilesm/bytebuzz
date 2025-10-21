"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { EditorState, LexicalEditor } from "lexical";
import { type RefObject, createContext, useContext, useRef } from "react";

import { EnhancedCodeBlockNode } from "./plugins/code-block/enhanced-code-block-node";
import { createMarkdownTheme, MARKDOWN_FEATURES } from "./markdown-config";
import { MediaNode } from "./plugins/media/media-node";
import { MentionNode } from "./plugins/mentions/mention-node";
import { log } from "@/lib/logger/logger";

// Create dynamic theme based on enabled features
const theme = createMarkdownTheme();

// Context for markdown editor
interface MarkdownContextValue {
  enableMentions: boolean;
  onChange?: (markdown: string, editorState: EditorState) => void;
  editorRef?: RefObject<LexicalEditor>;
}

const MarkdownContext = createContext<MarkdownContextValue | null>(null);

/**
 * Hook to access markdown editor context
 */
export function useMarkdownContext() {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error("useMarkdownContext must be used within a MarkdownProvider");
  }
  return context;
}

interface MarkdownProviderProps {
  /**
   * Children components
   */
  children: React.ReactNode;
  /**
   * Whether to enable mentions functionality
   */
  enableMentions?: boolean;
  /**
   * Callback when content changes
   */
  onChange?: (markdown: string, editorState: EditorState) => void;
  /**
   * Reference to the editor instance
   */
  editorRef?: RefObject<LexicalEditor>;
}

/**
 * Provider component that wraps the Lexical composer and provides context for markdown editor
 */
export function MarkdownProvider({
  children,
  enableMentions = false,
  onChange,
  editorRef: defaultEditorRef,
}: MarkdownProviderProps) {
  const internalEditorRef = useRef<LexicalEditor>({} as LexicalEditor);
  const editorRef = defaultEditorRef ?? internalEditorRef;

  const initialConfig = {
    namespace: "lexical-markdown-editor",
    theme,
    onError: (error: Error) => {
      log.error("Lexical Editor Error", { error });
    },
    nodes: [
      // Include nodes based on enabled features
      ...(MARKDOWN_FEATURES.headings ? [HeadingNode, QuoteNode] : []),
      ...(MARKDOWN_FEATURES.lists ? [ListNode, ListItemNode] : []),
      // Include CodeNode/CodeHighlightNode if ANY code feature is enabled (inline, blocks, or enhanced)
      ...(MARKDOWN_FEATURES.inlineCode ||
      MARKDOWN_FEATURES.codeBlocks ||
      MARKDOWN_FEATURES.enhancedCodeBlocks
        ? [CodeNode, CodeHighlightNode]
        : []),
      ...(MARKDOWN_FEATURES.links ? [LinkNode, AutoLinkNode] : []),
      ...(MARKDOWN_FEATURES.enhancedCodeBlocks ? [EnhancedCodeBlockNode] : []),
      ...(enableMentions && MARKDOWN_FEATURES.mentions ? [MentionNode] : []),
      ...(MARKDOWN_FEATURES.media ? [MediaNode] : []),
    ],
    editorState: undefined,
  };

  const contextValue: MarkdownContextValue = {
    enableMentions,
    onChange,
    editorRef,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MarkdownContext.Provider value={contextValue}>{children}</MarkdownContext.Provider>
    </LexicalComposer>
  );
}

"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { EditorState, LexicalEditor } from "lexical";
import { type RefObject, createContext, useContext, useRef } from "react";

import { EnhancedCodeBlockNode } from "./plugins/code-block/enhanced-code-block-node";
import { MediaNode } from "./plugins/media/media-node";
import { MentionNode } from "./plugins/mentions/mention-node";

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
    code: "bg-default/40 text-default-700 px-2 py-1 rounded-small px-1 font-mono text-sm",
  },
  code: "bg-default/40 text-default-700 px-2 py-1 rounded-small p-2 font-mono text-sm block mb-2",
  quote: "border-l-4 border-gray-300 pl-4 italic mb-2",
  link: "text-blue-500 underline hover:text-blue-700",
  mention:
    "bg-primary-100 text-primary-800 rounded px-1 py-0.5 font-medium cursor-pointer hover:bg-primary-200",
};

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
  enableMentions = true,
  onChange,
  editorRef: defaultEditorRef,
}: MarkdownProviderProps) {
  const internalEditorRef = useRef<LexicalEditor>({} as LexicalEditor);
  const editorRef = defaultEditorRef ?? internalEditorRef;

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

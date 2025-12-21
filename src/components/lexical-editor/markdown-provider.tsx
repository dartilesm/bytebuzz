"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { EditorState, LexicalEditor } from "lexical";
import { createContext, type RefObject, useContext, useRef } from "react";
import {
  createMarkdownTheme,
  MARKDOWN_FEATURES,
} from "@/components/lexical-editor/markdown-config";
import { EnhancedCodeBlockNode } from "@/components/lexical-editor/plugins/code-block/enhanced-code-block-node";
import { MediaNode } from "@/components/lexical-editor/plugins/media/media-node";
import { MentionNode, type User } from "@/components/lexical-editor/plugins/mentions/mention-node";
import { log } from "@/lib/logger/logger";
import type { SearchUsersReturnType } from "@/hooks/queries/options/user-queries";

// Create dynamic theme based on enabled features
const theme = createMarkdownTheme();

// Context for markdown editor
interface MarkdownContextValue {
  enableMentions: boolean;
  onUserSearch?: (query: string) => Promise<User[]>;
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
  /**
   * Custom user search function
   */
  onUserSearch?: (query: string) => Promise<User[]>;
}

/**
 * Provider component that wraps the Lexical composer and provides context for markdown editor
 */
export function MarkdownProvider({
  children,
  enableMentions = false,
  onChange,
  editorRef: defaultEditorRef,
  onUserSearch: onUserSearchProp,
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

  /**
   * Default implementation for user search that calls the internal API
   */
  async function defaultOnUserSearch(query: string): Promise<User[]> {
    try {
      const response = await fetch(`/api/users/search?searchTerm=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const result = (await response.json()) as SearchUsersReturnType;
      if (result.error) throw new Error(result.error.message);

      return (result.data || []).map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.image_url,
      }));
    } catch (error) {
      log.error("Error searching users in MarkdownProvider", { error, query });
      return [];
    }
  }

  const contextValue: MarkdownContextValue = {
    enableMentions,
    onUserSearch: onUserSearchProp ?? defaultOnUserSearch,
    onChange,
    editorRef,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MarkdownContext.Provider value={contextValue}>{children}</MarkdownContext.Provider>
    </LexicalComposer>
  );
}

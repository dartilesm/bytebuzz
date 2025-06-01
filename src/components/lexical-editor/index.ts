// Main editor component
export { MarkdownEditor } from "./lexical-editor";

// Plugins
export { CodeBlockPlugin, useSupportedLanguages } from "./plugins/code-block/code-block-plugin";
export {
  EnhancedCodeBlockNode,
  $createEnhancedCodeBlockNode,
  $isEnhancedCodeBlockNode,
} from "./plugins/code-block/enhanced-code-block-node";

// Toolbar
export { EditorToolbar } from "./plugins/toolbar/editor-toolbar";

// Utility functions
export { editorStateToMarkdown, markdownToEditorState } from "./functions/markdown-utils";

// Types
export type { User } from "./plugins/mentions/mention-node";
export type { SerializedEnhancedCodeBlockNode } from "./plugins/code-block/enhanced-code-block-node";

// Re-export Lexical types that might be useful
export type { EditorState, LexicalEditor } from "lexical";

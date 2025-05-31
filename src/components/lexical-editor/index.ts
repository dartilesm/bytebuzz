// Main editor component
export { MarkdownEditor } from "./lexical-editor";

// Plugins
export { CodeBlockPlugin, useSupportedLanguages } from "./plugins/code-block/code-block-plugin";

// Utility functions
export { editorStateToMarkdown, markdownToEditorState } from "./functions/markdown-utils";

// Types
export type { User } from "./plugins/mentions/mention-node";

// Re-export Lexical types that might be useful
export type { EditorState, LexicalEditor } from "lexical";

// Main editor component
export { MarkdownEditor } from "./lexical-editor";

// Utility functions
export { editorStateToMarkdown, markdownToEditorState } from "./functions/markdown-utils";

// Types
export type { User } from "./plugins/mentions/mention-node";

// Re-export Lexical types that might be useful
export type { EditorState, LexicalEditor } from "lexical";

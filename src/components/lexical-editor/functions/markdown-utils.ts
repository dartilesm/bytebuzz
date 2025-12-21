import { $convertToMarkdownString } from "@lexical/markdown";
import type { EditorState } from "lexical";
import { customTransformers } from "@/components/lexical-editor/markdown-config";

/**
 * Converts the current editor state to markdown string
 */
export function editorStateToMarkdown(editorState: EditorState): string {
  return editorState.read(() => {
    return $convertToMarkdownString(customTransformers);
  });
}

/**
 * Converts markdown string to editor state (placeholder for now, Lexical handles this via $convertFromMarkdownString)
 */
export function markdownToEditorState(markdown: string): string {
  return markdown;
}

import { $getRoot, type EditorState } from "lexical";
import { $isEnhancedCodeBlockNode } from "../plugins/code-block/enhanced-code-block-node";

/**
 * Converts the current editor state to markdown string
 */
export function editorStateToMarkdown(editorState: EditorState): string {
  return editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    const markdownParts: string[] = [];

    for (const child of children) {
      if ($isEnhancedCodeBlockNode(child)) {
        // Handle enhanced code blocks
        const language = child.getLanguage();
        const code = child.getCode();
        markdownParts.push(`\`\`\`${language}\n${code}\n\`\`\``);
      } else {
        // Handle other content - for now just get text content
        // This can be enhanced later to handle other markdown elements
        const text = child.getTextContent();
        if (text.trim()) {
          markdownParts.push(text);
        }
      }
    }

    return markdownParts.join("\n\n");
  });
}

/**
 * Placeholder function for converting markdown to editor state
 * This would be used for importing markdown content
 */
export function markdownToEditorState(markdown: string): string {
  // This is a placeholder - would need proper markdown parsing
  return markdown;
}

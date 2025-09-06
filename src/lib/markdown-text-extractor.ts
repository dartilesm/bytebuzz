/**
 * Extracts plain text from markdown content by removing all markdown syntax
 * @param content - The raw markdown content
 * @returns Plain text content with all markdown syntax removed
 */
export function extractPlainTextFromMarkdown(content: string): string {
  if (!content) return "";

  return (
    content
      // Remove code blocks (```language ... ```)
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code (`code`)
      .replace(/`[^`]*`/g, "")
      // Remove images (![alt](url))
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      // Remove links but keep the text ([text](url) -> text)
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Remove bold/italic markdown (**text** or *text* -> text)
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      // Remove headers (# ## ### -> text)
      .replace(/^#{1,6}\s+/gm, "")
      // Remove blockquotes (> text -> text)
      .replace(/^>\s*/gm, "")
      // Remove horizontal rules (--- or ***)
      .replace(/^[-*_]{3,}$/gm, "")
      // Remove list markers (- item or * item or 1. item -> item)
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Clean up extra whitespace and newlines
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

import { TRANSFORMERS } from "@lexical/markdown";
import { ENHANCED_CODE_BLOCK_TRANSFORMER } from "@/components/lexical-editor/plugins/code-block/enhanced-code-transformers";
import { MEDIA_TRANSFORMER } from "@/components/lexical-editor/plugins/media/media-transformer";

/**
 * Centralized configuration for markdown editor features
 * This file defines which markdown patterns are supported and their styling
 *
 * To enable/disable features:
 * 1. Change the boolean values in MARKDOWN_FEATURES
 * 2. The theme will automatically update to include/exclude relevant styles
 * 3. The editor will automatically include/exclude relevant nodes and transformers
 * 4. Excluded patterns will automatically be filtered from markdown processing
 *
 * Example: To enable headings (# ## ###), change `headings: false` to `headings: true`
 * This will:
 * - Add heading styles to the theme
 * - Include HeadingNode in the editor
 * - Remove "#" from EXCLUDED_PATTERNS
 * - Allow heading markdown shortcuts to work
 */

// Define which markdown features are enabled
export const MARKDOWN_FEATURES = {
  // Text formatting
  bold: true,
  italic: true,
  strikethrough: true,
  underline: true,
  inlineCode: true, // NOTE: Requires CodeNode - automatically included when any code feature is enabled

  // Block elements
  headings: false, // Disabled: excludes # patterns
  quotes: false, // Disabled: excludes > patterns
  codeBlocks: false, // Disabled: excludes ``` patterns (uses enhanced version)
  enhancedCodeBlocks: true, // NOTE: Requires CodeNode - automatically included when any code feature is enabled

  // Lists
  lists: true,

  // Links and mentions
  links: true,
  mentions: true,

  // Media
  media: true,
} as const;

// Patterns to exclude from transformers based on disabled features
export const EXCLUDED_PATTERNS = [
  // Code blocks (using enhanced version instead)
  ...(MARKDOWN_FEATURES.codeBlocks ? [] : ["```"]),
  // Headings
  ...(MARKDOWN_FEATURES.headings ? [] : ["#"]),
  // Quotes
  ...(MARKDOWN_FEATURES.quotes ? [] : [">"]),
] as const;

// Dynamic theme based on enabled features
export const createMarkdownTheme = () => {
  const theme: Record<string, string | Record<string, string>> = {
    paragraph: "mb-1",
  };

  // Only include heading styles if headings are enabled
  if (MARKDOWN_FEATURES.headings) {
    theme.heading = {
      h1: "text-2xl font-bold mb-2",
      h2: "text-xl font-bold mb-2",
      h3: "text-lg font-bold mb-1",
      h4: "text-base font-bold mb-1",
      h5: "text-sm font-bold mb-1",
      h6: "text-xs font-bold mb-1",
    };
  }

  // Only include list styles if lists are enabled
  if (MARKDOWN_FEATURES.lists) {
    theme.list = {
      ul: "list-disc pl-4 mb-2",
      ol: "list-decimal pl-4 mb-2",
      listitem: "mb-1",
    };
  }

  // Text formatting styles (based on enabled features)
  const textStyles: Record<string, string> = {};
  if (MARKDOWN_FEATURES.bold) textStyles.bold = "font-bold";
  if (MARKDOWN_FEATURES.italic) textStyles.italic = "italic";
  if (MARKDOWN_FEATURES.strikethrough) textStyles.strikethrough = "line-through";
  if (MARKDOWN_FEATURES.underline) textStyles.underline = "underline";
  if (MARKDOWN_FEATURES.inlineCode) {
    textStyles.code =
      "bg-default/40 text-default-700 px-2 py-1 rounded-small px-1 font-mono text-sm";
  }
  theme.text = textStyles;

  // Only include code styles if code blocks are enabled
  if (MARKDOWN_FEATURES.codeBlocks) {
    theme.code =
      "bg-default/40 text-default-700 px-2 py-1 rounded-small p-2 font-mono text-sm block mb-2";
  }

  // Only include quote styles if quotes are enabled
  if (MARKDOWN_FEATURES.quotes) {
    theme.quote = "border-l-4 border-gray-300 pl-4 italic mb-2";
  }

  // Only include link styles if links are enabled
  if (MARKDOWN_FEATURES.links) {
    theme.link = "text-blue-500 underline hover:text-blue-700";
  }

  // Only include mention styles if mentions are enabled
  if (MARKDOWN_FEATURES.mentions) {
    theme.mention =
      "bg-primary-100 text-primary-800 rounded px-1 py-0.5 font-medium cursor-pointer hover:bg-primary-200";
  }

  return theme;
};

/**
 * Check if transformer should be excluded based on regex patterns from centralized config
 */
function shouldExcludeTransformer(transformer: (typeof TRANSFORMERS)[number]): boolean {
  return (
    transformer.type === "element" &&
    "regExp" in transformer &&
    EXCLUDED_PATTERNS.some((pattern) => transformer.regExp?.source.includes(pattern))
  );
}

/**
 * Custom transformers that exclude disabled patterns and include enhanced code blocks
 * Used consistently across the editor and value plugin
 */
export const customTransformers = TRANSFORMERS.filter(
  (transformer) => !shouldExcludeTransformer(transformer),
)
  // Remove default image transformer if media is enabled (we use our custom one)
  .filter((transformer) => {
    if (MARKDOWN_FEATURES.media && transformer.type === "element") {
      // Check if this is the default image transformer by looking at its regex
      const imageRegex = /^!\[([^\]]*)\]\(([^)]+)\)$/;
      if ("regExp" in transformer && transformer.regExp?.source === imageRegex.source) {
        return false; // Exclude default image transformer
      }
    }
    return true;
  })
  .concat([
    ENHANCED_CODE_BLOCK_TRANSFORMER,
    ...(MARKDOWN_FEATURES.media ? [MEDIA_TRANSFORMER] : []),
  ]);

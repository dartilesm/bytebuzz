import { parseCodeBlockMetadata } from "@/components/markdown-viewer/functions/parse-code-block-metadata";
import { serializeImageUrl } from "@/components/markdown-viewer/functions/serialize-image-url";
import type { ContentItem } from "@/context/content-viewer-context";

/**
 * Extracts all viewable content (images and code blocks) from markdown content
 * @param options - The options for extracting content from markdown
 * @param options.markdown - The markdown content to extract content from
 * @param options.postId - The post ID to add to the image source URL
 * @returns An array of content items (images and code blocks) preserving order
 */
export function getAllContentFromMarkdown({
  markdown,
  postId,
}: {
  markdown: string;
  postId: string;
}): ContentItem[] {
  const contentItems: ContentItem[] = [];

  // Extract images
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let imageMatch;
  while ((imageMatch = imageRegex.exec(markdown)) !== null) {
    const src = imageMatch[2];
    const imageUrl = serializeImageUrl(src, { postId });

    contentItems.push({
      type: "image",
      id: imageUrl,
      data: {
        src: imageUrl,
        alt: imageMatch[1],
      },
    });
  }

  // Extract code blocks
  // Matches code blocks with optional language and metadata
  // Format: ```lang {meta}
  //         code content
  //         ```
  // Handles cases with or without newline after opening fence
  const codeBlockRegex = /```([a-zA-Z0-9-]+)?\s*(\{[^}]*\})?\s*\n?([\s\S]*?)```/g;
  let codeMatch;
  let codeIndex = 0;
  while ((codeMatch = codeBlockRegex.exec(markdown)) !== null) {
    const language = codeMatch[1] || "text";
    const meta = codeMatch[2] || "";
    const code = codeMatch[3] || "";

    const metadata = parseCodeBlockMetadata(meta);
    const filename = metadata?.fileName;

    // Generate a stable ID for code blocks based on content hash or index
    // Using a combination of postId, index, and a hash of the code content
    const codeId = `code-${postId}-${codeIndex}-${code.slice(0, 20).replace(/\s/g, "")}`;

    contentItems.push({
      type: "code",
      id: codeId,
      data: {
        language,
        code: code.trim(),
        filename,
      },
    });

    codeIndex++;
  }

  return contentItems;
}

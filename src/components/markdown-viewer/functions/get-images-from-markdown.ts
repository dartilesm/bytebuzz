import { EMOJI_PREFIX } from "@/components/lexical-editor/consts/emoji";
import { serializeImageUrl } from "@/components/markdown-viewer/functions/serialize-image-url";

/**
 * Extracts images from markdown content
 * @param options - The options for extracting images from markdown
 * @param options.markdown - The markdown content to extract images from
 * @param options.postId - The post ID to add to the image source URL
 * @returns An array of images with their alt text and source URL
 */
export function getImagesFromMarkdown({ markdown, postId }: { markdown: string; postId: string }) {
  const images: { src: string; alt: string }[] = [];
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const altText = match[1];
    // Skip custom emojis
    if (altText.startsWith(EMOJI_PREFIX)) continue;

    const src = match[2];
    // Use nuqs serializer to properly merge postId with existing URL and query params
    const imageUrl = serializeImageUrl(src, { postId });

    images.push({
      alt: altText,
      src: imageUrl,
    });
  }
  return images;
}

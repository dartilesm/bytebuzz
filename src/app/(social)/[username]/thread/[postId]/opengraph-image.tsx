import { createServerSupabaseClient } from "@/db/supabase";
import { extractPlainTextFromMarkdown } from "@/lib/markdown-text-extractor";
import {
  createPostThreadImage,
  createNotFoundImage,
  ogImageSize,
  contentType,
  type PostThreadImageData,
} from "@/lib/metadata-image-utils";
import type { NestedPost } from "@/types/nested-posts";

// Image metadata
export const size = ogImageSize;
export { contentType };

/**
 * Generates dynamic Open Graph image for post thread pages
 * Shows post content, author info, and engagement metrics
 */
export default async function Image({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  // Fetch post data
  const supabaseClient = createServerSupabaseClient();
  const { data: postAncestry } = await supabaseClient.rpc("get_post_ancestry", {
    start_id: postId,
  });

  if (!postAncestry || postAncestry.length === 0) {
    // Fallback image for post not found
    const buffer = createNotFoundImage("post", size);
    return new Response(buffer as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=1800",
      },
    });
  }

  const mainPost = postAncestry[postAncestry.length - 1] as NestedPost;
  const author = mainPost.user as { display_name?: string; username?: string; image_url?: string };
  const authorName = author?.display_name || author?.username || "Unknown User";
  const authorUsername = author?.username || "";
  const avatarUrl = author?.image_url;

  // Clean the post content for display
  const cleanContent = extractPlainTextFromMarkdown(mainPost.content || "");
  const displayContent =
    cleanContent.length > 200 ? `${cleanContent.substring(0, 200)}...` : cleanContent;

  const postData: PostThreadImageData = {
    authorName,
    authorUsername,
    avatarUrl,
    content: displayContent,
    starCount: mainPost.star_count || 0,
    coffeeCount: mainPost.coffee_count || 0,
    approveCount: mainPost.approve_count || 0,
  };

  // Generate the image
  const buffer = await createPostThreadImage(postData, size);

  return new Response(buffer as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=1800",
    },
  });
}

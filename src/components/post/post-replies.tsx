import { UserPost } from "@/components/post/user-post";
import type { NestedPost } from "@/types/nested-posts";

interface PostRepliesProps {
  post: NestedPost;
  /**
   * Maximum number of direct replies to render
   * @default 1
   */
  maxReplies?: number;
}

/**
 * Renders direct replies to a post
 * Only renders replies that are one level deeper than the current post
 */
export function PostReplies({ post, maxReplies = 1 }: PostRepliesProps) {
  if (!post.replies?.length) {
    return null;
  }

  const currentLevel = post.level ?? 1;
  const nextLevel = currentLevel + 1;

  const directReplies = post.replies
    .filter((reply) => reply.level === nextLevel)
    .slice(0, maxReplies);

  if (directReplies.length === 0) {
    return null;
  }

  return (
    <>
      {directReplies.map((reply) => (
        <UserPost key={reply.id} post={reply} />
      ))}
    </>
  );
}

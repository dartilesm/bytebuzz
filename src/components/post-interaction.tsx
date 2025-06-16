import { PostComposer } from "@/components/post-composer/post-composer";
import { CondensedUserPost } from "@/components/post/condensed-user-post";
import { PostThreadLine } from "@/components/post/post-thread-line";
import { UserPost } from "@/components/post/user-post";
import type { NestedPost } from "@/types/nested-posts";

interface PostInteractionProps {
  /**
   * The post to interact with (reply or repost)
   */
  post: NestedPost;
  /**
   * The type of interaction to perform
   */
  action: "reply" | "clone";
  /**
   * Callback function to be called after successful interaction
   */
  onSubmit?: () => void;
}

/**
 * A component that handles post interactions (replies and reposts)
 * It shows the original post and provides a composer for the interaction
 */
export function PostInteraction({
  post,
  action,
  onSubmit = () => Promise.resolve(),
}: PostInteractionProps) {
  const isReply = action === "reply";
  const isRepost = action === "clone";

  const replyPlaceholderText = `Reply to @${post.user?.username}`;
  const repostPlaceholderText = `Repost @${post.user?.username}'s post`;

  return (
    <div className="flex flex-col gap-2">
      {isReply && (
        <div className="relative">
          <PostThreadLine isFirstInThread />
          <UserPost post={post} isNavigationDisabled />
        </div>
      )}
      <PostComposer
        placeholder={isReply ? replyPlaceholderText : repostPlaceholderText}
        onSubmit={onSubmit}
        {...(isRepost && { repostPostId: post.id })}
        {...(isReply && { replyPostId: post.id })}
      >
        {isRepost && (
          <div className="mb-4 flex flex-col gap-1">
            <span className="text-sm text-content4-foreground/60 italic flex items-center gap-1">
              <span>Original post</span>
            </span>
            <CondensedUserPost post={post} />
          </div>
        )}
      </PostComposer>
    </div>
  );
}

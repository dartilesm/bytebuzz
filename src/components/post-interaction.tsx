import { PostComposer } from "@/components/post-composer/post-composer";
import { CondensedUserPost } from "@/components/post/condensed-user-post";
import { PostThreadLine } from "@/components/post/post-thread-line";
import { UserPost } from "@/components/post/user-post";
import type { NestedPost } from "@/types/nested-posts";
import { cn } from "@heroui/react";

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

  return (
    <div className='flex flex-col gap-2'>
      {isReply && (
        <div className='relative'>
          <PostThreadLine isFirstInThread />
          <UserPost post={post} isNavigationDisabled>
            {post.repost && <CondensedUserPost post={post.repost} isNavigationDisabled />}
          </UserPost>
        </div>
      )}
      <PostComposer
        placeholder='What are your thoughts?'
        onSubmit={onSubmit}
        {...(isRepost && { repostPostId: post.id })}
        {...(isReply && { replyPostId: post.id })}
        className={cn({
          "rounded-b-xl rounded-t-none": isReply,
        })}
      >
        {isRepost && (
          <div className='mb-4 flex flex-col gap-1'>
            <span className='text-sm text-content4-foreground/60 italic flex items-center gap-1'>
              <span>Original post</span>
            </span>
            <CondensedUserPost post={post} isNavigationDisabled />
          </div>
        )}
      </PostComposer>
    </div>
  );
}

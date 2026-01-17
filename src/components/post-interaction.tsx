import { RepeatIcon } from "lucide-react";
import { CondensedUserPost } from "@/components/post/condensed-user-post";
import { PostThreadLine } from "@/components/post/post-thread-line";
import { UserPost } from "@/components/post/user-post";
import { PostComposer } from "@/components/post-composer/post-composer";
import { cn } from "@/lib/utils";
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
  /**
   * Additional className to be applied to the component
   */
  className?: string;
}

/**
 * A component that handles post interactions (replies and reposts)
 * It shows the original post and provides a composer for the interaction
 */
export function PostInteraction({
  post,
  action,
  onSubmit = () => Promise.resolve(),
  className,
}: PostInteractionProps) {
  const isReply = action === "reply";
  const isRepost = action === "clone";

  return (
    <div className={cn("flex flex-col gap-2 rounded-xl bg-muted", className)}>
      {isReply && (
        <div className="relative max-h-[40dvh] overflow-auto scrollbar-auto bg-card">
          <PostThreadLine isFirstInThread />
          <UserPost post={post} isNavigationDisabled className="rounded-none border-0">
            {post.repost && <CondensedUserPost post={post.repost} isNavigationDisabled />}
          </UserPost>
        </div>
      )}
      <PostComposer
        placeholder="What are your thoughts?"
        onSubmit={onSubmit}
        {...(isRepost && { repostPostId: post.id })}
        {...(isReply && { replyPostId: post.id })}
        className={cn("border-0 rounded-none", {
          "rounded-b-xl": isReply,
          "dark:hover:bg-muted": isRepost,
        })}
      >
        {isRepost && (
          <div className="mb-4 flex flex-col gap-1">
            <span className="text-sm text-muted-foreground/60 italic flex items-center gap-1">
              <RepeatIcon size={14} />
              <span> Original post</span>
            </span>
            <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-border bg-card-foreground/5 dark:bg-card scrollbar-auto">
              <CondensedUserPost
                className="bg-transparent border-none"
                post={post}
                isNavigationDisabled
              />
            </div>
          </div>
        )}
      </PostComposer>
    </div>
  );
}

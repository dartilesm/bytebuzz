import { calculateThreadState } from "@/components/post/functions/thread-state-utils";
import { PostCard } from "@/components/post/post-card";
import { PostContent } from "@/components/post/post-card-content";
import { PostFooter } from "@/components/post/post-card-footer";
import { PostHeader } from "@/components/post/post-card-header";
import { PostReplies } from "@/components/post/post-replies";
import { UserPostThread } from "@/components/post/user-post-thread";
import { PostProvider } from "@/context/post-provider";
import type { NestedPost } from "@/types/nested-posts";

interface UserPostProps {
  /**
   * Ancestral posts in the thread hierarchy (parent posts)
   * Used to display the thread context above the current post
   */
  ancestry?: NestedPost[];
  /**
   * The post data to display
   * Either post or ancestry must be provided
   */
  post?: NestedPost;
  /**
   * Explicitly control whether this post should render as part of a thread
   * If not provided, will be calculated based on post level and replies
   */
  isThread?: boolean;
  /**
   * Explicitly mark this post as the first in a thread
   * If not provided, will be calculated based on post level
   */
  isFirstInThread?: boolean;
  /**
   * Explicitly mark this post as the last in a thread
   * If not provided, will be calculated based on whether post has replies
   */
  isLastInThread?: boolean;
  /**
   * React ref to attach to the post card element
   */
  ref?: React.RefObject<HTMLDivElement>;
  /**
   * Additional CSS classes to apply to the post card
   */
  className?: string;
  /**
   * When true, disables click-to-navigate interaction on the post
   * Used when the post is displayed in a modal context where navigation should be prevented
   */
  isNavigationDisabled?: boolean;
  /**
   * Custom content to render inside the post (e.g., repost content)
   */
  children?: React.ReactNode;
  /**
   * Minimum content length before expansion controls appear
   */
  minVisibleContentLength?: number;
  /**
   * Initial characters per each expansion level
   */
  charsPerLevel?: number;
}

/**
 * Main component for rendering a user post with all its features
 * Supports thread rendering, ancestry display, and nested replies
 *
 * @example
 * ```tsx
 * <UserPost post={postData} />
 * ```
 *
 * @example
 * ```tsx
 * <UserPost
 *   post={postData}
 *   ancestry={ancestralPosts}
 *   isNavigationDisabled
 * >
 *   <CondensedUserPost post={repostData} />
 * </UserPost>
 * ```
 */
export function UserPost({
  ancestry,
  post,
  isThread,
  isFirstInThread,
  isLastInThread,
  ref,
  className,
  isNavigationDisabled,
  children,
  minVisibleContentLength,
  charsPerLevel,
}: UserPostProps) {
  if (!post && !ancestry) {
    throw new Error("Either post or ancestry must be provided");
  }

  const threadState = calculateThreadState({
    post,
    isThread,
    isFirstInThread,
    isLastInThread,
  });

  return (
    <>
      {ancestry && <UserPostThread posts={ancestry} />}
      {post && (
        <PostProvider
          post={post}
          isThread={threadState.renderAsThread}
          isFirstInThread={threadState.isFirstInThread}
          isLastInThread={threadState.isLastInThread}
          isNavigationDisabled={isNavigationDisabled}
          minVisibleContentLength={minVisibleContentLength}
          charsPerLevel={charsPerLevel}
        >
          <PostCard ref={ref} className={className}>
            <PostHeader />
            <PostContent>{children}</PostContent>
            <PostFooter />
          </PostCard>
          <PostReplies post={post} />
        </PostProvider>
      )}
    </>
  );
}

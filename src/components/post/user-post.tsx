import { PostCard } from "@/components/post/post-card";
import { PostContent } from "@/components/post/post-card-content";
import { PostFooter } from "@/components/post/post-card-footer";
import { PostHeader } from "@/components/post/post-card-header";
import { UserPostThread } from "@/components/post/user-post-thread";
import { PostProvider } from "@/context/post-provider";
import type { NestedPost } from "@/types/nested-posts";
interface UserPostProps {
  ancestry?: UserPostProps["post"][];
  post?: NestedPost;
  isThread?: boolean;
  isFirstInThread?: boolean;
  isLastInThread?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
  className?: string;
  isNavigationDisabled?: boolean;
  children?: React.ReactNode;
  minVisibleContentLength?: number;
  charsPerLevel?: number;
}

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

  const hasLevel = !!post?.level;
  const isFirstLevel = !!post?.level && post.level === 1;
  const hasReplies = !!post?.replies?.length;

  const renderAsThread = (isThread ?? hasLevel) ? !isFirstLevel || hasReplies : false;
  const firstInThread = isFirstInThread ?? isFirstLevel;
  const lastInThread = isLastInThread ?? !hasReplies;

  return (
    <>
      {ancestry && <UserPostThread posts={ancestry as NestedPost[]} />}
      {post && (
        <PostProvider
          post={post}
          isThread={renderAsThread}
          isFirstInThread={firstInThread}
          isLastInThread={lastInThread}
          isNavigationDisabled={isNavigationDisabled}
          minVisibleContentLength={minVisibleContentLength}
          charsPerLevel={charsPerLevel}
        >
          <PostCard ref={ref} className={className}>
            <PostHeader />
            <PostContent>{children}</PostContent>
            <PostFooter />
          </PostCard>
          {post?.replies
            ?.filter((reply) => reply.level === (post.level ?? 1) + 1)
            .slice(0, 1)
            .map((reply) => (
              <UserPost key={reply.id} post={reply} />
            ))}
        </PostProvider>
      )}
    </>
  );
}

import { PostComposer } from "@/components/post/post-composer";
import { PostThreadLine } from "@/components/post/post-thread-line";
import { UserPost } from "@/components/post/user-post";
import type { NestedPost } from "@/types/nested-posts";

interface ReplyToPostProps {
  post: NestedPost;
  onSubmit?: () => void;
}

export function ReplyToPost({ post, onSubmit = () => Promise.resolve() }: ReplyToPostProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <PostThreadLine isFirstInThread />
        <UserPost post={post} isNavigationDisabled />
      </div>
      <PostComposer
        placeholder={`Reply to @${post.user?.username}`}
        onSubmit={onSubmit}
        postId={post.id}
      />
    </div>
  );
}

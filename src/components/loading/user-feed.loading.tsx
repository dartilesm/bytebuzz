import { UserPostLoading } from "@/components/loading/user-post.loading";
import { PostComposer } from "@/components/post-composer/post-composer";
import { PostsProvider } from "@/context/posts-context";

export function UserFeedLoading() {
  return (
    <div className="w-full p-4 flex flex-col gap-4">
      <PostsProvider initialPosts={[]}>
        <PostComposer />
        <UserPostLoading />
        <UserPostLoading />
        <UserPostLoading />
        <UserPostLoading />
      </PostsProvider>
    </div>
  );
}

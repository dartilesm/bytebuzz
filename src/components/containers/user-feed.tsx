import { PostComposer } from "@/components/post-composer/post-composer";
import { PostList } from "@/components/post/post-list";
import { PostsProvider } from "@/context/posts-context";
import { userService } from "@/services/user.service";

export async function UserFeed() {
  const { data: initialPosts, error } = await userService.getUserFeed();

  if (error) return <span>Ops! Error loading posts</span>;

  return (
    <PostsProvider initialPosts={initialPosts || []}>
      <div className="w-full p-4 flex flex-col gap-4">
        <PostComposer />
        <PostList />
      </div>
    </PostsProvider>
  );
}

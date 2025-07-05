import { PostComposer } from "@/components/post-composer/post-composer";
import { PostList } from "@/components/post/post-list";
import { PostsProvider } from "@/context/posts-context";
import { feedService } from "@/services/feed.service";

export async function UserFeed() {
  const { data: initialPosts, error } = await feedService.getUserFeed();

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

import { PostComposer } from "@/components/post-composer/post-composer";
import { PostList } from "@/components/post/post-list";
import { Section } from "@/components/ui/container";
import { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { PostsProvider } from "@/context/posts-context";
import { postService } from "@/lib/db/services/post.service";

export async function UserFeed() {
  const { data: initialPosts, error } = await postService.getUserFeed();

  if (error) return <span>Ops! Error loading posts</span>;

  return (
    <PostsProvider initialPosts={initialPosts || []}>
      <Section className="w-full flex flex-col gap-2 md:gap-4">
        <PostComposer />
        <PostList postQueryType={POST_QUERY_TYPE.USER_FEED} />
      </Section>
    </PostsProvider>
  );
}

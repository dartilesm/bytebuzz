import { PostComposer } from "@/components/post-composer/post-composer";
import { PostList } from "@/components/post/post-list";
import { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { PostsProvider } from "@/context/posts-context";
import { createClient } from "@supabase/supabase-js";
import { postService } from "@/lib/db/services/post.service";
import { NestedPost } from "@/types/nested-posts";
import type { Database } from "database.types";

async function getCachedUserFeed(accessToken: string | null, cursor?: string) {
  "use cache";

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    }
  );

  let query = supabase.rpc("get_user_feed").order("created_at", { ascending: false }).limit(10);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  return await query.overrideTypes<NestedPost[]>();
}

export async function UserFeed({ accessToken }: { accessToken: string | null }) {
  const { data: initialPosts, error } = await getCachedUserFeed(accessToken);

  if (error) return <span>Ops! Error loading posts</span>;

  return (
    <PostsProvider initialPosts={initialPosts || []}>
      <div className='w-full p-4 flex flex-col gap-4'>
        <PostComposer />
        <PostList postQueryType={POST_QUERY_TYPE.USER_FEED} />
      </div>
    </PostsProvider>
  );
}

import { PostComposer } from "@/components/post-composer/post-composer";
import { PostList } from "@/components/post/post-list";
import { PostsProvider } from "@/context/posts-context";
import { createServerSupabaseClient } from "@/db/supabase";

/**
 * Fetches posts for the user feed with optional cursor for pagination
 * @param cursor - Optional cursor (timestamp) to fetch posts before this point
 * @returns Promise with posts data and error if any
 */
async function getPosts(cursor?: string) {
  "use server";
  const supabaseClient = createServerSupabaseClient();

  let query = supabaseClient
    .rpc("get_user_feed")
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  // If cursor is provided, filter posts created before this timestamp
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const result = await query;
  return result;
}

export async function UserFeed() {
  const { data: initialPosts, error } = await getPosts();

  if (error) return <span>Ops! Error loading posts</span>;

  return (
    <PostsProvider initialPosts={initialPosts || []} fetchMorePosts={getPosts}>
      <div className="w-full p-4 flex flex-col gap-4">
        <PostComposer />
        <PostList />
      </div>
    </PostsProvider>
  );
}

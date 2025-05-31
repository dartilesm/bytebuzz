import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import { PostComposer } from "@/components/post/post-composer";
import { PostList } from "@/components/post/post-list";
import { RichPostComposer } from "@/components/rich-editor/rich-post-composer";
import { PostsProvider } from "@/context/posts-context";
import { createServerSupabaseClient } from "@/db/supabase";

async function getPosts() {
  const supabaseClient = createServerSupabaseClient();
  const result = await supabaseClient
    .rpc("get_user_feed")
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  return result;
}

export async function UserFeed() {
  const { data: initialPosts, error } = await getPosts();

  if (error) return <span>Ops! Error loading posts</span>;

  return (
    <PostsProvider initialPosts={initialPosts || []}>
      <div className="w-full p-4 flex flex-col gap-4">
        <RichPostComposer />
        <MarkdownViewer
          markdown={`Editor content: Hi everybody, *hope* you are doing **great**.

\`\`\`javascript
function getConsole() {
  console.log('hi')
}
\`\`\`
`}
        />
        <PostComposer />
        <PostList />
      </div>
    </PostsProvider>
  );
}

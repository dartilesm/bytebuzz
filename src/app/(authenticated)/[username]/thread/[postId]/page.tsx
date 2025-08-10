import { PostComposer } from "@/components/post-composer/post-composer";
import { PostList } from "@/components/post/post-list";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PageHeader } from "@/components/ui/page-header";
import { PostsProvider } from "@/context/posts-context";
import { createServerSupabaseClient } from "@/db/supabase";
import { withAnalytics } from "@/lib/with-analytics";
import type { NestedPost } from "@/types/nested-posts";
import { notFound } from "next/navigation";

function nestReplies(posts: NestedPost[]) {
  const map = new Map();
  const roots: NestedPost[] = [];

  for (const post of posts) {
    post.replies = [];
    map.set(post.id, post);
  }

  for (const post of posts) {
    if (post.parent_post_id && map.has(post.parent_post_id)) {
      const parent = map.get(post.parent_post_id);
      parent.replies.push(post);
    } else {
      roots.push(post);
    }
  }

  return roots;
}

async function getPostData(postId: string) {
  const supabaseClient = createServerSupabaseClient();

  const { data: postAncestry, error: postAncestryError } = await supabaseClient.rpc(
    "get_post_ancestry",
    {
      start_id: postId,
    },
  );

  if (postAncestryError) {
    console.error("Error fetching thread:", postAncestryError);
  } else {
  }

  const { data: directReplies, error: directRepliesError } = await supabaseClient
    .rpc("get_replies_to_depth", { target_id: postId, max_depth: 2 })
    .order("created_at", { ascending: false });

  if (directRepliesError) {
    console.error("Error fetching direct replies:", directRepliesError);
  } else {
  }

  const result: {
    postAncestry: NestedPost[];
    directReplies: NestedPost[];
  } = {
    postAncestry,
    directReplies: nestReplies(directReplies),
  };

  return result;
}

interface ThreadPageProps {
  params: Promise<{
    username: string;
    postId: string;
  }>;
}

async function ThreadPage({ params }: ThreadPageProps) {
  const { postId } = await params;
  const { postAncestry, directReplies } = await getPostData(postId);

  console.log({ postAncestry, directReplies });

  if (!postAncestry || postAncestry.length === 0) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Thread" />
      <div className="flex flex-col gap-4 w-full">
        <PostsProvider initialPosts={directReplies || []}>
          <PostWrapper isAncestry>
            <UserPost ancestry={postAncestry} />
          </PostWrapper>
          <PostComposer
            placeholder={`Reply to @${postAncestry?.at(-1)?.user?.username}`}
            replyPostId={postId}
          />
          <div className="flex flex-col gap-4 min-h-[100dvh]">
            <h2 className="text-lg font-medium">Replies</h2>
            {!!directReplies?.length && <PostList />}
          </div>
        </PostsProvider>
      </div>
    </>
  );
}

export default withAnalytics(ThreadPage, { event: "page-view" });

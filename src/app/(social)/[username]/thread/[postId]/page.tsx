import { PostComposer } from "@/components/post-composer/post-composer";
import { PostList } from "@/components/post/post-list";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PageHeader } from "@/components/ui/page-header";
import { PostsProvider } from "@/context/posts-context";
import { createServerSupabaseClient } from "@/db/supabase";
import { generatePostThreadMetadata, generateFallbackMetadata } from "@/lib/metadata-utils";
import { withAnalytics } from "@/lib/with-analytics";
import type { NestedPost } from "@/types/nested-posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getLogger } from "@/lib/logger";

const log = getLogger(__filename);

// Cache post threads for 30 minutes
export const revalidate = 1800;

function nestReplies(posts: NestedPost[] | null) {
  const map = new Map();
  const roots: NestedPost[] = [];

  if (!posts) {
    return roots;
  }

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

const getPostData = cache(async (postId: string) => {
  const supabaseClient = createServerSupabaseClient();

  const { data: postAncestry, error: postAncestryError } = await supabaseClient
    .rpc("get_post_ancestry", {
      start_id: postId,
    })
    .overrideTypes<NestedPost[]>();

  if (postAncestryError) {
    log.error({ postAncestryError }, "Error fetching thread:");
  }

  const { data: directReplies, error: directRepliesError } = await supabaseClient
    .rpc("get_replies_to_depth", { target_id: postId, max_depth: 2 })
    .order("created_at", { ascending: false })
    .overrideTypes<NestedPost[]>();

  if (directRepliesError) {
    log.error({ directRepliesError }, "Error fetching direct replies:");
  }

  const result = {
    postAncestry,
    directReplies: nestReplies(directReplies),
  };

  return result;
});

interface ThreadPageProps {
  params: Promise<{
    username: string;
    postId: string;
  }>;
}

/**
 * Generates dynamic metadata for post thread pages
 * Includes Open Graph and Twitter Card tags for better social sharing
 */
export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const { postId } = await params;

  try {
    const { postAncestry } = await getPostData(postId);
    const mainPost = postAncestry?.[postAncestry.length - 1];

    if (!mainPost) {
      return generateFallbackMetadata("thread");
    }

    return generatePostThreadMetadata(mainPost);
  } catch (error) {
    log.error({ error }, "Error generating post thread metadata:");
    return generateFallbackMetadata("thread");
  }
}

async function ThreadPage({ params }: ThreadPageProps) {
  const { postId } = await params;
  const { postAncestry, directReplies } = await getPostData(postId);

  if (!postAncestry || postAncestry.length === 0) {
    notFound();
  }

  return (
    <>
      <PageHeader title='Thread' />
      <div className='flex flex-col gap-4 w-full'>
        <PostsProvider initialPosts={directReplies || []}>
          <PostWrapper isAncestry>
            <UserPost ancestry={postAncestry} />
          </PostWrapper>
          <PostComposer
            placeholder={`Reply to @${postAncestry?.at(-1)?.user?.username}`}
            replyPostId={postId}
          />
          <div className='flex flex-col gap-4 min-h-[100dvh]'>
            <h2 className='text-lg font-medium'>Replies</h2>
            {!!directReplies?.length && <PostList />}
          </div>
        </PostsProvider>
      </div>
    </>
  );
}

export default withAnalytics(ThreadPage, { event: "page-view" });

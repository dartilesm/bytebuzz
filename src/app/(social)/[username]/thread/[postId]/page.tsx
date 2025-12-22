import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post/post-list";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostComposer } from "@/components/post-composer/post-composer";
import { PageHeader } from "@/components/ui/page-header";
import { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { PostsProvider } from "@/context/posts-context";
import { postQueries } from "@/hooks/queries/options/post-queries";
import { postService } from "@/lib/db/services/post.service";
import { log } from "@/lib/logger/logger";
import { generateFallbackMetadata, generatePostThreadMetadata } from "@/lib/metadata-utils";
import { withAnalytics } from "@/lib/with-analytics";

async function getPostData(postId: string) {
  const { data, error } = await postService.getPostThread(postId);

  if (error) {
    log.error("Error fetching thread", { error });
  }

  return {
    postAncestry: data?.postAncestry,
    directReplies: data?.directReplies,
  };
}

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
    log.error("Error generating post thread metadata", { error });
    return generateFallbackMetadata("thread");
  }
}

async function ThreadPage({ params }: ThreadPageProps) {
  const { postId } = await params;
  const { postAncestry, directReplies } = await getPostData(postId);

  const lastPost = postAncestry?.at(-1);
  const username = lastPost?.user?.username;

  const queryClient = new QueryClient();

  queryClient.prefetchQuery({
    queryKey: postQueries.list({ queryType: POST_QUERY_TYPE.POST_REPLIES, username, postId })
      .queryKey,
    queryFn: () => ({ directReplies, postAncestry }),
  });

  queryClient.prefetchQuery({
    queryKey: postQueries.thread({ postId }).queryKey,
    queryFn: () => directReplies,
  });

  if (!postAncestry || postAncestry.length === 0) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader title="Thread" />
      <div className="flex flex-col gap-4 w-full px-2 md:px-4">
        <PostsProvider initialPosts={directReplies || []}>
          <PostWrapper isAncestry>
            <UserPost ancestry={postAncestry} />
          </PostWrapper>
          <h2 className="text-lg font-medium">Replies</h2>
          <PostComposer
            placeholder={`Reply to @${postAncestry?.at(-1)?.user?.username}`}
            replyPostId={postId}
          />
          <div className="flex flex-col gap-4 min-h-dvh">
            {!!directReplies?.length && (
              <PostList postQueryType={POST_QUERY_TYPE.POST_REPLIES} postId={postId} />
            )}
          </div>
        </PostsProvider>
      </div>
    </HydrationBoundary>
  );
}

export default withAnalytics(ThreadPage, { event: "page-view" });

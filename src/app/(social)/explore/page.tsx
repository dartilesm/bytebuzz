import { ExploreView } from "@/components/containers/explorer-view/explore-view";
import { postRepository } from "@/lib/db/repositories/post.repository";
import { getCachedTrendingUsers } from "@/lib/db/calls/get-trending-users";
import { getCachedUsers } from "@/lib/db/calls/get-users";
import { withAnalytics } from "@/lib/with-analytics";

export type ExplorerPageSearchParams = {
  all?: string;
  users?: string;
  posts?: string;
  page?: number;
};

async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const {
    all,
    users: usersSearchTerm,
    posts: postsSearchTerm,
    page = 0,
  } = (await searchParams) as ExplorerPageSearchParams;

  if (all) {
    const users = await getCachedUsers({
      searchTerm: all as string,
    });
    const posts = await postRepository.searchPosts({
      searchTerm: all as string,
    });

    return <ExploreView users={users} posts={posts} />;
  }

  if (usersSearchTerm) {
    const users = await getCachedUsers({
      searchTerm: usersSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView users={users} />;
  }

  if (postsSearchTerm) {
    const posts = await postRepository.searchPosts({
      searchTerm: postsSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView posts={posts} />;
  }

  const trendingPosts = await postRepository.getTrendingPosts();
  const trendingUsers = await getCachedTrendingUsers();

  return <ExploreView posts={trendingPosts} users={trendingUsers} />;
}

export default withAnalytics(ExplorePage, { event: "page-view" });

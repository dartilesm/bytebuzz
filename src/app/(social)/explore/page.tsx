import { ExploreView } from "@/components/containers/explorer-view/explore-view";
import { getCachedPosts } from "@/lib/db/calls/get-posts";
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
    const posts = await getCachedPosts({
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
    const posts = await getCachedPosts({
      searchTerm: postsSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView posts={posts} />;
  }

  return <ExploreView />;
}

export default withAnalytics(ExplorePage, { event: "page-view" });

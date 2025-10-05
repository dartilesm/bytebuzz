import { ExploreView } from "@/components/containers/explore-view";
import { getCachedPosts } from "@/lib/db/calls/get-posts";
import { getCachedUsers } from "@/lib/db/calls/get-users";
import { withAnalytics } from "@/lib/with-analytics";

async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const { searchTerm, user, post, page = 0 } = await searchParams;

  if (searchTerm) {
    const users = await getCachedUsers({
      searchTerm: searchTerm as string,
    });
    const posts = await getCachedPosts({
      searchTerm: searchTerm as string,
    });

    return <ExploreView users={users} posts={posts} />;
  }

  if (user) {
    const users = await getCachedUsers({
      searchTerm: user as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView users={users} />;
  }

  if (post) {
    const posts = await getCachedPosts({
      searchTerm: post as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView posts={posts} />;
  }

  return <ExploreView />;
}

export default withAnalytics(ExplorePage, { event: "page-view" });

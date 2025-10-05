import { ExploreView } from "@/components/containers/explore-view";
import { getCachedPosts } from "@/lib/db/calls/get-posts";
import { getCachedUsers } from "@/lib/db/calls/get-users";
import { withAnalytics } from "@/lib/with-analytics";

async function getExploreData(searchTerm: string) {
  const usersPromise = getCachedUsers(searchTerm as string, 50);
  const postsPromise = getCachedPosts(searchTerm as string, 10);

  const [users, posts] = await Promise.all([usersPromise, postsPromise]);

  return { users: users.data, posts: posts.data };
}

async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const { searchTerm } = await searchParams;

  const { users, posts } = await getExploreData(searchTerm as string);
  return <ExploreView users={users || []} posts={posts || []} />;
}

export default withAnalytics(ExplorePage, { event: "page-view" });

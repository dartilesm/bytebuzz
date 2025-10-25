import { ExploreView } from "@/components/containers/explorer-view/explore-view";
import { postService } from "@/lib/db/services/post.service";
import { userService } from "@/lib/db/services/user.service";
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
    const users = await userService.searchUsers({
      searchTerm: all as string,
    });
    const posts = await postService.searchPosts({
      searchTerm: all as string,
    });

    return <ExploreView users={users} posts={posts} />;
  }

  if (usersSearchTerm) {
    const users = await userService.searchUsers({
      searchTerm: usersSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView users={users} />;
  }

  if (postsSearchTerm) {
    const posts = await postService.searchPosts({
      searchTerm: postsSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView posts={posts} />;
  }

  const trendingPosts = await postService.getTrendingPosts();
  const trendingUsers = await userService.getTrendingUsers();

  return <ExploreView posts={trendingPosts} users={trendingUsers} />;
}

export default withAnalytics(ExplorePage, { event: "page-view" });

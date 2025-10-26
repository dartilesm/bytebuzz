import { ExploreView } from "@/components/containers/explore-view/explore-view";
import { withCacheService } from "@/lib/db/with-cache-service";
import { withAnalytics } from "@/lib/with-analytics";
import { currentUser } from "@clerk/nextjs/server";
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
  const user = await currentUser();

  if (all) {
    const usersPromise = withCacheService("userService", "searchUsers", {
      cacheTags: ["explore-page", "search-users", user?.id ?? "", searchParams?.toString() ?? ""],
    })({
      searchTerm: all as string,
    });
    const postsPromise = withCacheService("postService", "searchPosts", {
      cacheTags: ["explore-page", "search-posts", user?.id ?? "", searchParams?.toString() ?? ""],
    })({
      searchTerm: all as string,
    });

    return <ExploreView postsPromise={postsPromise} usersPromise={usersPromise} />;
  }

  if (usersSearchTerm) {
    const usersPromise = withCacheService("userService", "searchUsers", {
      cacheTags: ["explore-page", "search-users", user?.id ?? "", searchParams?.toString() ?? ""],
    })({
      searchTerm: usersSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView usersPromise={usersPromise} postsPromise={undefined} />;
  }

  if (postsSearchTerm) {
    const postsPromise = withCacheService("postService", "searchPosts", {
      cacheTags: ["explore-page", "search-posts", user?.id ?? "", searchParams?.toString() ?? ""],
    })({
      searchTerm: postsSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView postsPromise={postsPromise} />;
  }

  const postsPromise = withCacheService("postService", "getTrendingPosts", {
    cacheTags: ["explore-page", "trending-posts", user?.id ?? "", searchParams?.toString() ?? ""],
  })();
  const usersPromise = withCacheService("userService", "getTrendingUsers", {
    cacheTags: ["explore-page", "trending-users", user?.id ?? "", searchParams?.toString() ?? ""],
  })();

  return <ExploreView key='explore-page' postsPromise={postsPromise} usersPromise={usersPromise} />;
}

export default withAnalytics(ExplorePage, { event: "page-view" });

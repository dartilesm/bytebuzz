import { ExploreView } from "@/components/containers/explore-view/explore-view";
import { postService } from "@/lib/db/services/post.service";
import { userService } from "@/lib/db/services/user.service";
import { withCacheService } from "@/lib/db/with-cache-service";
import { withAnalytics } from "@/lib/with-analytics";
import { currentUser } from "@clerk/nextjs/server";
export type ExplorePageSearchParams = {
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
  } = (await searchParams) as ExplorePageSearchParams;
  const user = await currentUser();

  if (all) {
    const usersPromise = userService.searchUsers({
      searchTerm: all as string,
    });
    const postsPromise = postService.searchPosts({
      searchTerm: all as string,
    });

    return <ExploreView postsPromise={postsPromise} usersPromise={usersPromise} />;
  }

  if (usersSearchTerm) {
    const usersPromise = userService.searchUsers({
      searchTerm: usersSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return <ExploreView usersPromise={usersPromise} postsPromise={undefined} />;
  }

  if (postsSearchTerm) {
    const postsPromise = postService.searchPosts({
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

import { ExploreView } from "@/components/containers/explorer-view/explore-view";
import { ExplorerViewPosts } from "@/components/containers/explorer-view/explorer-view-posts";
import { ExplorerViewUsers } from "@/components/containers/explorer-view/explorer-view-users";
import { ExplorerViewPostsLoading } from "@/components/containers/explorer-view/loading/explore-view-posts.loading";
import { postService } from "@/lib/db/services/post.service";
import { userService } from "@/lib/db/services/user.service";
import { withAnalytics } from "@/lib/with-analytics";
import { Suspense } from "react";

export type ExplorerPageSearchParams = {
  all?: string;
  users?: string;
  posts?: string;
  page?: number;
};

async function TrendingPosts({
  postsPromise,
  title,
}: {
  postsPromise?:
    | ReturnType<typeof postService.getTrendingPosts>
    | ReturnType<typeof postService.searchPosts>;
  title?: string;
}) {
  const trendingPosts = await postsPromise;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await sleep(8000);
  return <ExplorerViewPosts posts={trendingPosts} title={title} />;
}

async function TrendingUsers({
  usersPromise,
  title,
}: {
  usersPromise?:
    | ReturnType<typeof userService.getTrendingUsers>
    | ReturnType<typeof userService.searchUsers>;
  title?: string;
}) {
  const trendingUsers = await usersPromise;
  return <ExplorerViewUsers users={trendingUsers} title={title} />;
}

async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const {
    all,
    users: usersSearchTerm,
    posts: postsSearchTerm,
    page = 0,
  } = (await searchParams) as ExplorerPageSearchParams;

  if (all) {
    const usersPromise = userService.searchUsers({
      searchTerm: all as string,
    });
    const postsPromise = postService.searchPosts({
      searchTerm: all as string,
    });

    return (
      <ExploreView
        postsResult={
          <Suspense fallback={<div>Loading posts...</div>}>
            <TrendingPosts postsPromise={postsPromise} title='Trending Posts' />
          </Suspense>
        }
        usersResult={
          <Suspense fallback={<div>Loading users...</div>}>
            <TrendingUsers usersPromise={usersPromise} title='Trending Users' />
          </Suspense>
        }
      />
    );
  }

  if (usersSearchTerm) {
    const usersPromise = userService.searchUsers({
      searchTerm: usersSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return (
      <ExploreView
        usersResult={
          <Suspense fallback={<div>Loading users...</div>}>
            <TrendingUsers usersPromise={usersPromise} />
          </Suspense>
        }
      />
    );
  }

  if (postsSearchTerm) {
    const postsPromise = postService.searchPosts({
      searchTerm: postsSearchTerm as string,
      offsetCount: isNaN(+page) ? 10 : 10 * +page,
    });
    return (
      <ExploreView
        postsResult={
          <Suspense fallback={<div>Loading posts...</div>}>
            <TrendingPosts postsPromise={postsPromise} />
          </Suspense>
        }
      />
    );
  }

  const postsPromise = postService.getTrendingPosts();
  const usersPromise = userService.getTrendingUsers();

  return (
    <ExploreView
      postsResult={
        <Suspense fallback={<ExplorerViewPostsLoading />}>
          <TrendingPosts postsPromise={postsPromise} title='Trending Posts' />
        </Suspense>
      }
      usersResult={
        <Suspense fallback={<div>Loading users...</div>}>
          <TrendingUsers usersPromise={usersPromise} title='Trending Users' />
        </Suspense>
      }
    />
  );
}

export default withAnalytics(ExplorePage, { event: "page-view" });

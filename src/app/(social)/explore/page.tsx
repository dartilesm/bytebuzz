import { ExploreView } from "@/components/containers/explore-view/explore-view";
import { ExplorerViewPosts } from "@/components/containers/explore-view/explore-view-posts";
import { ExplorerViewUsers } from "@/components/containers/explore-view/explore-view-users";
import { ExplorerViewPostsLoading } from "@/components/containers/explore-view/loading/explore-view-posts.loading";
import { ExplorerViewUsersLoading } from "@/components/containers/explore-view/loading/explore-view-users.loading";
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
        key='all-search'
        postsResult={
          <Suspense fallback={<ExplorerViewPostsLoading />}>
            <ExplorerViewPosts
              postsPromise={postsPromise}
              title='Trending Posts'
              showEmptyState={false}
            />
          </Suspense>
        }
        usersResult={
          <Suspense fallback={<ExplorerViewUsersLoading />}>
            <ExplorerViewUsers
              usersPromise={usersPromise}
              title='Trending Users'
              showEmptyState={false}
            />
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
        key='users-search'
        usersResult={
          <Suspense fallback={<ExplorerViewUsersLoading />}>
            <ExplorerViewUsers usersPromise={usersPromise} />
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
        key='posts-search'
        postsResult={
          <Suspense fallback={<ExplorerViewPostsLoading />}>
            <ExplorerViewPosts postsPromise={postsPromise} />
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
          <ExplorerViewPosts
            postsPromise={postsPromise}
            title='Trending Posts'
            showEmptyState={false}
          />
        </Suspense>
      }
      usersResult={
        <Suspense fallback={<ExplorerViewUsersLoading />}>
          <ExplorerViewUsers
            usersPromise={usersPromise}
            title='Trending Users'
            showEmptyState={false}
          />
        </Suspense>
      }
    />
  );
}

export default withAnalytics(ExplorePage, { event: "page-view" });

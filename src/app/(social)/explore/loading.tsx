import { ExploreViewPostsLoading } from "@/components/containers/explore-view/loading/explore-view-posts.loading";
import { ExploreViewUsersLoading } from "@/components/containers/explore-view/loading/explore-view-users.loading";
import { SearchBox } from "@/components/explore/search-box";
import { PageHeader } from "@/components/ui/page-header";

export default function ExploreLoading() {
  return (
    <>
      <PageHeader className='pr-4'>
        <SearchBox placeholder='Search users or posts...' />
      </PageHeader>
      <div className='flex flex-col gap-4'>
        <ExploreViewUsersLoading />
        <ExploreViewPostsLoading />
      </div>
    </>
  );
}

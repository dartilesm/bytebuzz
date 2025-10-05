import { SearchBox } from "@/components/explore/search-box";
import { UserPostLoading } from "@/components/loading/user-post.loading";
import { PageHeader } from "@/components/ui/page-header";

export default function ExploreLoading() {
  return (
    <>
      <PageHeader className='pr-4'>
        <SearchBox placeholder='Search users or posts...' />
      </PageHeader>
      <UserPostLoading />
      <UserPostLoading />
      <UserPostLoading />
      <UserPostLoading />
      <UserPostLoading />
      <UserPostLoading />
    </>
  );
}

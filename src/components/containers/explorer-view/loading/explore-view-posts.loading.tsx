import { UserPostLoading } from "@/components/loading/user-post.loading";
import { Skeleton } from "@heroui/skeleton";

export function ExplorerViewPostsLoading() {
  return (
    <section className='space-y-4'>
      <div className='flex flex-col gap-4'>
        <Skeleton className='w-40 h-6 rounded-lg' />
        <UserPostLoading />
        <UserPostLoading />
        <UserPostLoading />
        <UserPostLoading />
      </div>
    </section>
  );
}

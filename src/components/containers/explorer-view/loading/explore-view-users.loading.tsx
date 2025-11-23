import { UserCard2Loading } from "@/components/loading/user-card-2.loading";
import { Skeleton } from "@/components/ui/skeleton";

export function ExplorerViewUsersLoading() {
  return (
    <div className='space-y-4'>
      <Skeleton className='w-56 h-6 rounded-lg' />
      <div className='flex flex-row gap-4 overflow-hidden'>
        <UserCard2Loading />
        <UserCard2Loading />
        <UserCard2Loading />
      </div>
    </div>
  );
}

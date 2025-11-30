import { UserPostLoading } from "@/components/loading/user-post.loading";
import { Skeleton } from "@/components/ui/skeleton";

export function ExplorerViewPostsLoading() {
  return (
    <section className="space-y-4">
      <Skeleton className="w-40 h-6 rounded-lg" />
      <div className="flex flex-col gap-4">
        <UserPostLoading />
        <UserPostLoading />
        <UserPostLoading />
        <UserPostLoading />
      </div>
    </section>
  );
}

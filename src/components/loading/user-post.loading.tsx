import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A loading state component that shows a simplified post structure with avatar and two lines
 */
export function UserPostLoading() {
  return (
    <div>
      <article
        className={cn(
          "relative flex flex-row dark:bg-content1 bg-card [box-shadow:none] p-4 h-32 gap-4 rounded-lg",
        )}
      >
        <Skeleton className="size-11 rounded-full shrink-0" />
        <div className="w-full flex gap-4 flex-col">
          {/* Header skeleton */}
          <Skeleton className="w-3/4 h-4 rounded-lg" />
          {/* Description skeleton */}
          <Skeleton className="w-full h-4 rounded-lg" />
          <div className="flex gap-2 justify-between">
            <Skeleton className="w-14 h-7 rounded-full" />
            <Skeleton className="w-14 h-7 rounded-full" />
            <Skeleton className="w-14 h-7 rounded-full" />
            <Skeleton className="w-14 h-7 rounded-full" />
          </div>
        </div>
      </article>
    </div>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A loading state component for UserCard2 that matches the new stunning design
 */
export function UserCard2Loading() {
  return (
    <Card className="group relative flex flex-col overflow-hidden bg-background/60 dark:bg-background/40 max-w-48 w-full shrink-0 py-0">
      {/* Cover Skeleton */}
      <div className="relative h-20 w-full">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <CardContent className="relative flex flex-col items-center p-0">
        {/* Avatar Skeleton */}
        <div className="relative -mt-24 mb-3">
          <Skeleton className="size-24 rounded-full border-4 border-background shadow-lg" />
        </div>

        {/* User Info Skeleton */}
        <div className="flex w-full flex-col items-center gap-2 px-4 max-w-full">
          <div className="w-full flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
          <Skeleton className="mt-2 h-8 w-full rounded-lg" />
        </div>

        {/* Follow Button Skeleton */}
        <div className="w-full px-4 py-2">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UserProfileCoverAvatarLoading() {
  return (
    <div>
      <Skeleton className="w-full aspect-[12/4] rounded-t-none" />
      <div className="relative">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

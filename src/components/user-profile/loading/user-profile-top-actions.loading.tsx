"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UserProfileTopActionsLoading() {
  return (
    <div className='flex justify-between'>
      <div className='flex gap-2'>
        <Skeleton className='w-10 h-10 rounded-lg' />
        <Skeleton className='w-10 h-10 rounded-lg' />
      </div>
      <div className='flex flex-row gap-1.5 items-center'>
        <Skeleton className='w-10 h-10 rounded-lg' />
        <Skeleton className='w-24 h-10 rounded-lg' />
      </div>
    </div>
  );
}

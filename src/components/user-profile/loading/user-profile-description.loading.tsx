"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UserProfileDescriptionLoading() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-start w-full'>
        <div className='flex flex-col gap-2 flex-1'>
          <Skeleton className='w-48 h-8 rounded-lg' />
          <Skeleton className='w-32 h-5 rounded-lg' />
        </div>
      </div>

      {/* Top Technologies Section */}
      <div className='flex flex-wrap gap-2'>
        <Skeleton className='w-20 h-6 rounded-full' />
        <Skeleton className='w-24 h-6 rounded-full' />
        <Skeleton className='w-16 h-6 rounded-full' />
      </div>

      <div className='space-y-2'>
        <Skeleton className='w-full h-4 rounded-lg' />
        <Skeleton className='w-3/4 h-4 rounded-lg' />
      </div>

      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-3 flex-wrap'>
          <Skeleton className='w-32 h-4 rounded-lg' />
          <Skeleton className='w-40 h-4 rounded-lg' />
        </div>

        <div className='flex items-center gap-3'>
          <Skeleton className='w-24 h-4 rounded-lg' />
          <div className='h-3 w-px bg-default-200' />
          <Skeleton className='w-24 h-4 rounded-lg' />
        </div>
      </div>
    </div>
  );
}

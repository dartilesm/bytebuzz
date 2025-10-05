"use client";

import { Card, CardBody, CardFooter, Skeleton } from "@heroui/react";

/**
 * A loading state component for UserCard2 that shows skeleton placeholders
 */
export function UserCard2Loading() {
  return (
    <Card className='relative rounded-2xl overflow-hidden max-w-[220px] shrink-0 border border-default-200 dark:border-default-100 shadow-xs bg-secondary-500/10 dark:bg-secondary-400/10'>
      {/* Gradient Background Accent */}
      <Skeleton className='absolute top-0 left-0 right-0 h-20 rounded-none' />

      <CardBody className='p-0'>
        <div className='relative px-5 py-6 flex flex-col items-center gap-4'>
          {/* Avatar skeleton */}
          <Skeleton className='size-24 rounded-full ring-4 ring-background' />

          {/* User info skeleton */}
          <div className='text-center w-full space-y-1 flex flex-col items-center'>
            <Skeleton className='h-6 w-32 rounded-lg' />
            <Skeleton className='h-4 w-24 rounded-lg' />
          </div>

          {/* Stats skeleton */}
          <div className='flex gap-6 text-sm w-full justify-center py-2 border-y border-default-200'>
            <div className='text-center flex flex-col items-center gap-1'>
              <Skeleton className='h-5 w-8 rounded-lg' />
              <Skeleton className='h-3 w-16 rounded-lg' />
            </div>
            <div className='h-auto w-px bg-default-200' />
            <div className='text-center flex flex-col items-center gap-1'>
              <Skeleton className='h-5 w-8 rounded-lg' />
              <Skeleton className='h-3 w-16 rounded-lg' />
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className='pt-0'>
        {/* Follow button skeleton */}
        <Skeleton className='w-full h-10 rounded-lg' />
      </CardFooter>
    </Card>
  );
}

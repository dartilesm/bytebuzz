"use client";

import { SearchBox } from "@/components/explore/search-box";
import { UserCard2Loading } from "@/components/loading/user-card-2.loading";
import { UserPostLoading } from "@/components/loading/user-post.loading";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@heroui/react";

export function ExplorerClientPageLoading() {
  return (
    <>
      <PageHeader className='pr-4'>
        <SearchBox placeholder='Search users or posts...' />
      </PageHeader>
      <div className='flex flex-col gap-4'>
        <Skeleton className='w-56 h-6 rounded-lg' />
        <div className='flex flex-row gap-4 overflow-hidden'>
          <UserCard2Loading />
          <UserCard2Loading />
          <UserCard2Loading />
        </div>
        <div className='flex flex-col gap-4'>
          <Skeleton className='w-40 h-6 rounded-lg' />
          <UserPostLoading />
          <UserPostLoading />
          <UserPostLoading />
          <UserPostLoading />
        </div>
      </div>
    </>
  );
}

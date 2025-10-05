"use client";

import { UserCard2 } from "@/components/explore/user-card-2";
import type { getCachedTrendingUsers } from "@/lib/db/calls/get-trending-users";
import type { getCachedUsers } from "@/lib/db/calls/get-users";
import { Button } from "@heroui/react";
import type { Tables } from "database.types";
import { User2Icon } from "lucide-react";

interface ExplorerViewUsersProps {
  users?:
    | Awaited<ReturnType<typeof getCachedUsers>>
    | Awaited<ReturnType<typeof getCachedTrendingUsers>>;
  usersSearchTerm?: string;
  onExploreAll?: () => void;
}

/**
 * A beautiful list of users component for the explorer view
 * Displays users in a responsive grid layout with horizontal scrolling
 */
export function ExplorerViewUsers({
  users,
  usersSearchTerm,
  onExploreAll,
}: ExplorerViewUsersProps) {
  if (!users?.data || users.data.length === 0) {
    return (
      <div className='w-full max-w-[1024px] mx-auto px-4 py-8 flex flex-col justify-center'>
        <div className='text-center py-12'>
          <div className='flex justify-center mb-6'>
            <User2Icon className='w-16 h-16 text-content3' />
          </div>
          <h3 className='text-xl font-semibold text-default-600 mb-2'>
            {usersSearchTerm ? `No users found for "${usersSearchTerm}"` : "No users found"}
          </h3>
          <p className='text-default-400'>Try adjusting your search terms or explore all content</p>
        </div>
        <Button variant='flat' color='primary' className='m-auto' onClick={onExploreAll}>
          Explore all content
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full max-w-[1024px] mx-auto px-4 py-6'>
      <div className='grid gap-4'>
        {users?.data.map((user) => (
          <UserCard2 key={user.id} user={user as unknown as Tables<"users">} />
        ))}
      </div>
    </div>
  );
}

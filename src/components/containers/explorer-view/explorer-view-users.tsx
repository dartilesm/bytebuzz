"use client";

import { UserCard2 } from "@/components/explore/user-card-2";
import { userService } from "@/lib/db/services/user.service";
import type { Tables } from "database.types";

interface ExplorerViewUsersProps {
  users?:
    | Awaited<ReturnType<typeof userService.searchUsers>>
    | Awaited<ReturnType<typeof userService.getTrendingUsers>>;
}

/**
 * A beautiful list of users component for the explorer view
 * Displays users in a responsive grid layout with horizontal scrolling
 */
export function ExplorerViewUsers({ users }: ExplorerViewUsersProps) {
  return (
    <div className='w-full max-w-5xl mx-auto px-4 py-6'>
      <div className='grid gap-4'>
        {users?.data?.map((user) => (
          <UserCard2 key={user.id} user={user as unknown as Tables<"users">} />
        ))}
      </div>
    </div>
  );
}

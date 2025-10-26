"use client";

import { ExplorerViewEmpty } from "@/components/containers/explorer-view/explorer-view-empty";
import { UserCard2 } from "@/components/explore/user-card-2";
import { userService } from "@/lib/db/services/user.service";
import { ScrollShadow } from "@heroui/react";
import type { Tables } from "database.types";

interface ExplorerViewUsersProps {
  users?:
    | Awaited<ReturnType<typeof userService.searchUsers>>
    | Awaited<ReturnType<typeof userService.getTrendingUsers>>;
  variant?: "grid" | "scroll";
  title?: string;
}

/**
 * A beautiful list of users component for the explorer view
 * Displays users in a responsive grid layout with horizontal scrolling
 */
export function ExplorerViewUsers({ users, variant = "grid", title }: ExplorerViewUsersProps) {
  if (!users || users?.data?.length === 0) {
    return <ExplorerViewEmpty searchedBy='users' />;
  }
  return (
    <section className='space-y-4'>
      {title && <h2 className='text-lg font-medium'>{title}</h2>}
      {variant === "scroll" && (
        <ScrollShadow className='flex gap-4 flex-row scrollbar-auto pb-4' orientation='horizontal'>
          {users?.data?.map((user) => (
            <UserCard2 key={user.id} user={user as unknown as Tables<"users">} />
          ))}
        </ScrollShadow>
      )}
      {variant === "grid" && (
        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
          {users?.data?.map((user) => (
            <UserCard2 key={user.id} user={user as unknown as Tables<"users">} />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { ExploreViewEmpty } from "@/components/containers/explore-view/explore-view-empty";
import { UserVerticalCard } from "@/components/explore/user-vertical-card";
import type { userService } from "@/lib/db/services/user.service";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Tables } from "database.types";
import { use } from "react";

export interface ExplorerViewUsersProps {
  usersPromise:
    | ReturnType<typeof userService.searchUsers>
    | ReturnType<typeof userService.getTrendingUsers>;
  variant?: "grid" | "scroll";
  title?: string;
  showEmptyState?: boolean;
}

/**
 * A beautiful list of users component for the explorer view
 * Displays users in a responsive grid layout with horizontal scrolling
 */
export function ExploreViewUsers({
  usersPromise,
  variant = "grid",
  title,
}: ExplorerViewUsersProps) {
  // Adding Promise<unknown> to avoid type errors
  // apparently, apparuse doesn't like type unions
  const users = use(usersPromise as Promise<unknown>) as Awaited<
    ExplorerViewUsersProps["usersPromise"]
  >;

  const hasResults = users?.data && users?.data?.length > 0;

  return (
    <section className='space-y-4'>
      {title && <h2 className='text-lg font-medium'>{title}</h2>}
      {!hasResults && <ExploreViewEmpty />}
      {variant === "scroll" && hasResults && (
        <ScrollArea
          className='w-full whitespace-nowrap pb-4 [&>div>div]:w-max'
          shadowClassName='from-background'
          orientation='horizontal'
        >
          <div className='flex gap-4'>
            {users?.data?.map((user) => (
              <UserVerticalCard key={user.id} user={user as unknown as Tables<"users">} />
            ))}
          </div>
        </ScrollArea>
      )}
      {variant === "grid" && hasResults && (
        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
          {users?.data?.map((user) => (
            <UserVerticalCard key={user.id} user={user as unknown as Tables<"users">} />
          ))}
        </div>
      )}
    </section>
  );
}

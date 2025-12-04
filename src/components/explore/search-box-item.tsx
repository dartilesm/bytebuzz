"use client";

import type { Database } from "database.types";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import type { UrlObject } from "url";
import { FollowButton } from "@/components/ui/follow-button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useUserDataQuery } from "@/hooks/queries/use-user-data-query";

type User = Database["public"]["Functions"]["search_users"]["Returns"][0];
type SearchItem = { id: string; type: "search"; term: string };
type CombinedItem = User | SearchItem;

interface SearchBoxItemProps {
  item: CombinedItem;
  onExactSearch?: () => void;
}

export function SearchBoxItem({ item, onExactSearch }: SearchBoxItemProps) {
  // Handle user item
  const user = item as User;

  const { data: userData, isLoading } = useUserDataQuery(user.id ?? "");

  // Handle search item
  if ("type" in item && item.type === "search") {
    return (
      <div className="w-full cursor-pointer group">
        <div className="flex items-center gap-3" onClick={onExactSearch}>
          <div className="flex items-center justify-center size-9 rounded-full bg-muted group-hover:bg-background transition-colors border border-transparent group-hover:border-border">
            <SearchIcon className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h4 className="text-sm text-foreground font-medium">
              Search for &ldquo;{item.term}&rdquo;
            </h4>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <SearchBoxItemSkeleton />;
  }

  return (
    <Link className="w-full block" href={`/@${userData?.username}` as unknown as UrlObject}>
      <div className="flex justify-between items-center gap-3">
        <div className="flex gap-3 items-center flex-1 min-w-0">
          <UserAvatar user={userData} className="size-10 border border-border" />
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {userData?.display_name}
              </h4>
              <span className="text-xs text-muted-foreground truncate">@{userData?.username}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">{userData?.follower_count ?? 0}</span>{" "}
                followers
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">
                  {userData?.following_count ?? 0}
                </span>{" "}
                following
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <FollowButton targetUserId={userData?.id ?? ""} size="sm" />
        </div>
      </div>
    </Link>
  );
}

function SearchBoxItemSkeleton() {
  return (
    <div className="w-full block">
      <div className="flex justify-between items-center gap-3">
        <div className="flex gap-3 items-center flex-1 min-w-0">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

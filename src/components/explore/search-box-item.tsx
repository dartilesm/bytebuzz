"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Database } from "database.types";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import type { UrlObject } from "url";
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

  const { data: userData } = useUserDataQuery(user.id ?? "");

  // Handle search item
  if ("type" in item && item.type === "search") {
    return (
      <div className='w-full cursor-pointer'>
        <div className='flex items-center gap-3' onClick={onExactSearch}>
          <div className='flex items-center justify-center size-8 rounded-full bg-transparent dark:bg-muted'>
            <SearchIcon className='size-4 text-muted-foreground' />
          </div>
          <div className='flex flex-col gap-1 flex-1 min-w-0'>
            <h4 className='text-xs text-foreground font-medium'>
              Search for &ldquo;{item.term}&rdquo;
            </h4>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Link
      className='w-full block rounded-lg transition-colors'
      href={`/@${userData?.username}` as unknown as UrlObject}
    >
      <div className='flex justify-between items-center gap-3'>
        <div className='flex gap-3 items-center flex-1 min-w-0'>
          <Avatar className="size-8 border-2 border-background">
            <AvatarImage src={userData?.image_url ?? undefined} alt={userData?.display_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userData?.display_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-1 flex-1 min-w-0'>
            <h4 className='text-xs font-semibold text-foreground truncate'>
              {userData?.display_name}
            </h4>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground font-medium'>@{userData?.username}</span>
              <span className='text-xs text-muted-foreground'>•</span>
              <span className='text-xs text-muted-foreground'>{userData?.follower_count} followers</span>
            </div>
          </div>
        </div>
        <div className='shrink-0'>
          <FollowButton targetUserId={userData?.id ?? ""} size='sm' />
        </div>
      </div>
    </Link>
  );
}

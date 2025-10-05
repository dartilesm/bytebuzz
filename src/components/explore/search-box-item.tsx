"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { Avatar, Card, CardBody } from "@heroui/react";
import type { Database } from "database.types";
import { SearchIcon } from "lucide-react";

type User = Database["public"]["Functions"]["search_users"]["Returns"][0];
type SearchItem = { id: string; type: "search"; term: string };
type CombinedItem = User | SearchItem;

interface SearchBoxItemProps {
  item: CombinedItem;
  onExactSearch?: () => void;
}

export function SearchBoxItem({ item, onExactSearch }: SearchBoxItemProps) {
  // Handle search item
  if ("type" in item && item.type === "search") {
    return (
      <Card className='w-full border-none shadow-none bg-transparent'>
        <CardBody className='p-0'>
          <div className='flex items-center gap-3' onClick={onExactSearch}>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-transparent dark:bg-default-200'>
              <SearchIcon className='w-5 h-5 text-default-600 dark:text-default-400' />
            </div>
            <div className='flex flex-col gap-1 flex-1 min-w-0'>
              <h4 className='text-small font-semibold text-foreground'>
                Search for &ldquo;{item.term}&rdquo;
              </h4>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Handle user item
  const user = item as User;
  return (
    <Card className='w-full border-none shadow-none bg-transparent'>
      <CardBody className='p-0'>
        <div className='flex justify-between items-center gap-3'>
          <div className='flex gap-3 items-center flex-1 min-w-0'>
            <Avatar
              alt={user.display_name}
              className='shrink-0 ring-2 ring-default-100 dark:ring-default-50'
              size='md'
              src={user.image_url ?? undefined}
              fallback={
                <div className='flex items-center justify-center w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-900 text-primary-600 dark:text-primary-300 font-semibold'>
                  {user.display_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              }
            />
            <div className='flex flex-col gap-1 flex-1 min-w-0'>
              <h4 className='text-small font-semibold text-foreground truncate'>
                {user.display_name}
              </h4>
              <div className='flex items-center gap-2'>
                <span className='text-tiny text-default-500 font-medium'>@{user.username}</span>
                <span className='text-tiny text-default-300'>•</span>
                <span className='text-tiny text-default-400'>{user.follower_count} followers</span>
              </div>
            </div>
          </div>
          <div className='shrink-0'>
            <FollowButton targetUserId={user.id} size='sm' className='shadow-small' />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

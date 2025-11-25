"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables } from "database.types";
import { useUserDataQuery } from "@/hooks/queries/use-user-data-query";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfilePopoverContentProps {
  user: Partial<Tables<"users">>;
}

function UserProfilePopoverSkeleton() {
  return (
    <div className="max-w-[300px] rounded-xl flex flex-col py-0 gap-0 w-full">
      <div className="justify-between flex flex-row gap-4 px-3 py-3">
        <div className="flex gap-3 w-full">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex flex-col items-start justify-center gap-1.5 w-full">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="px-3 py-0 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="flex gap-1 items-center">
          <Skeleton className="w-6 h-4" />
          <Skeleton className="w-12 h-3" />
        </div>
        <div className="flex gap-1 items-center">
          <Skeleton className="w-6 h-4" />
          <Skeleton className="w-12 h-3" />
        </div>
      </div>
    </div>
  );
}

export function UserProfilePopoverContent({ user }: UserProfilePopoverContentProps) {
  const { data: userData, isLoading } = useUserDataQuery(user.id ?? "");

  if (isLoading) return <UserProfilePopoverSkeleton />;

  return (
    <div className="max-w-[300px] rounded-xl flex flex-col py-0 gap-0">
      <div className="justify-between flex flex-row gap-4 px-3 py-3">
        <div className="flex gap-3">
          <Avatar className="size-10 border-2 border-background rounded-full">
            <AvatarImage src={user.image_url ?? undefined} alt={user.display_name ?? ""} />
            <AvatarFallback>{user.display_name?.[0] ?? user.username?.[0] ?? ""}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start justify-center">
            <h4 className="text-sm font-semibold leading-none text-foreground">
              {user.display_name ?? user.username}
            </h4>
            <h5 className="text-sm tracking-tight text-muted-foreground">@{user.username}</h5>
          </div>
        </div>
        <FollowButton targetUserId={user.id ?? ""} />
      </div>
      {user.bio && (
        <div className="px-3 py-0">
          <p className="text-sm pl-px text-muted-foreground">{user.bio}</p>
        </div>
      )}
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="flex gap-1">
          <p className="font-semibold text-foreground text-sm">{userData?.follower_count ?? 0}</p>
          <p className="text-muted-foreground text-sm">Followers</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-foreground text-sm">{userData?.following_count ?? 0}</p>
          <p className="text-muted-foreground text-sm">Following</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables } from "database.types";

interface UserProfilePopoverContentProps {
  user: Partial<Tables<"users">>;
}

export function UserProfilePopoverContent({ user }: UserProfilePopoverContentProps) {
  return (
    <div className="max-w-[300px] shadow-sm rounded-xl flex flex-col py-0 gap-0">
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
          <p className="font-semibold text-foreground text-sm">{user.following_count ?? 0}</p>
          <p className="text-muted-foreground text-sm">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-foreground text-sm">{user.follower_count ?? 0}</p>
          <p className="text-muted-foreground text-sm">Followers</p>
        </div>
      </div>
    </div>
  );
}

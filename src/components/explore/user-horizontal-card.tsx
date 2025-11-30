"use client";

import { PostWrapper } from "@/components/post/post-wrapper";
import { FollowButton } from "@/components/ui/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Tables } from "database.types";
import Link from "next/link";

interface UserHorizontalCardProps {
  user: Tables<"users">;
}

export function UserHorizontalCard({ user }: UserHorizontalCardProps) {
  return (
    <PostWrapper>
      <Card className="p-4 flex flex-col justify-between gap-4 relative dark:bg-card bg-card shadow-sm cursor-pointer border-0">
        <div className="flex flex-row items-start gap-4">
          <Link href={`/@${user.username}`} className="shrink-0">
            <Avatar className="size-12 border">
              <AvatarImage src={user.image_url ?? undefined} alt={user.display_name} />
              <AvatarFallback>{user.display_name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="grow min-w-0 flex flex-col gap-2">
            <div className="flex flex-row gap-2 w-full justify-between">
              <Link href={`/@${user.username}`} className="block overflow-hidden">
                <h3 className="font-semibold text-foreground truncate overflow-hidden">
                  {user.display_name}
                </h3>
                <p className="text-sm text-muted-foreground truncate overflow-hidden">
                  @{user.username}
                </p>
              </Link>
              <FollowButton targetUserId={user.id} className="shrink-0" />
            </div>
            {user.bio && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
            )}
          </div>
        </div>
      </Card>
    </PostWrapper>
  );
}

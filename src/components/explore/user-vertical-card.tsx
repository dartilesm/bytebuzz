"use client";

import { useUser } from "@clerk/nextjs";
import type { Tables } from "database.types";
import Image from "next/image";
import Link from "next/link";
import type { UrlObject } from "url";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "@/components/ui/follow-button";
import { cn } from "@/lib/utils";

interface UserVerticalCardProps {
  user: Tables<"users">;
}

/**
 * A vertical user card component for the explore view
 * @param user - The user to display
 * @returns A vertical user card component
 */
export function UserVerticalCard({ user }: UserVerticalCardProps) {
  const { user: currentUser } = useUser();
  const isSameUser = currentUser?.id === user.id;

  return (
    <Card className="group relative flex flex-col overflow-hidden bg-background/60dark:bg-background/40 max-w-48 w-full shrink-0 py-0">
      {/* Cover Image or Gradient */}
      <div className="relative h-20 w-full overflow-hidden bg-muted">
        <div
          className={cn("absolute inset-0", {
            "bg-linear-to-br from-primary/30 via-primary/10 to-background": !user.cover_image_url,
          })}
        >
          {user.cover_image_url && (
            <Image
              src={user.cover_image_url || ""}
              alt={user.display_name}
              fill
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-60" />
      </div>

      <CardContent className="relative flex flex-col items-center p-0 flex-1">
        <Link
          href={`/@${user.username}` as unknown as UrlObject}
          className="flex flex-col items-center w-full gap-2 py-2"
        >
          {/* Avatar */}
          <div className="relative -mt-24 mb-3">
            <Avatar className="size-24 border-4 border-background shadow-lg ring-1 ring-border/10 transition-transform duration-300 group-hover:scale-105">
              <AvatarImage
                src={user.image_url || undefined}
                alt={user.display_name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {user.display_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center gap-1 px-4 text-center max-w-full w-full">
            <div>
              <h3 className="line-clamp-1 text-md font-bold text-foreground max-w-full w-full text-wrap">
                {user.display_name}
              </h3>
              <p className="line-clamp-1 text-sm font-medium text-muted-foreground text-wrap">
                @{user.username}
              </p>
            </div>
            {user.bio && (
              <p className="line-clamp-2 text-xs text-muted-foreground/80 max-w-full text-wrap">
                {user.bio}
              </p>
            )}
          </div>
          <div className="w-full px-4 h-8"></div>
        </Link>
        {!isSameUser && (
          <FollowButton
            targetUserId={user.id}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)]"
          />
        )}
      </CardContent>
    </Card>
  );
}

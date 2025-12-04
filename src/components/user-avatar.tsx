"use client";

import type { Tables } from "database.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /**
   * User object from database (snake_case fields)
   */
  user?: Partial<Tables<"users">>;
  /**
   * Avatar image URL (alternative to user.image_url)
   */
  avatarUrl?: string;
  /**
   * Display name (alternative to user.display_name)
   */
  name?: string;
  /**
   * Join date in ISO string format (alternative to user.join_date)
   */
  joinDate?: string | null;
  /**
   * Whether to show the welcome badge for new users (default: true)
   */
  showWelcomeBadge?: boolean;
  /**
   * Additional className to apply to the avatar
   */
  className?: string;
}

/**
 * Checks if a date is within the last 7 days
 */
function isNewUser(joinDate: string | null | undefined): boolean {
  if (!joinDate) return false;

  const joinDateObj = new Date(joinDate);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return joinDateObj >= sevenDaysAgo && joinDateObj <= now;
}

/**
 * UserAvatar component that displays a user's avatar with an optional welcome badge
 * for users who joined in the last 7 days.
 *
 * Supports both a user object prop and individual props for flexibility.
 */
export function UserAvatar({
  user,
  avatarUrl,
  name,
  joinDate,
  showWelcomeBadge = true,
  className,
}: UserAvatarProps) {
  const imageUrl = avatarUrl ?? user?.image_url ?? undefined;
  const displayName = name ?? user?.display_name ?? "";
  const userJoinDate = joinDate ?? user?.join_date ?? null;

  const shouldShowBadge = showWelcomeBadge && isNewUser(userJoinDate);

  return (
    <div
      className={cn(
        "relative size-24 border-4 border-background ring-1 ring-border/10 rounded-full",
        className,
      )}
    >
      <Avatar className="size-full">
        <AvatarImage src={imageUrl} alt={displayName} />
        <AvatarFallback>{displayName?.[0] ?? ""}</AvatarFallback>
      </Avatar>
      {shouldShowBadge && (
        <Badge className="text-2xs absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 bg-green-600 dark:bg-green-700">
          New
        </Badge>
      )}
    </div>
  );
}

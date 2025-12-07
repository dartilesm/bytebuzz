"use client";

import type { Tables } from "database.types";
import Image from "next/image";
import { use } from "react";
import { UserAvatar } from "@/components/user-avatar";

export interface UserProfileCoverAvatarProps {
  profilePromise: Promise<Tables<"users">>;
}

export function UserProfileCoverAvatar({ profilePromise }: UserProfileCoverAvatarProps) {
  const profile = use(profilePromise);
  return (
    <div className="space-y-4">
      <div className="w-full aspect-12/4 relative">
        <div className="absolute top-0 md:-left-4 -left-2 w-[calc(100%+16px)] md:w-[calc(100%+32px)] h-full bg-linear-to-bl from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
          {profile.cover_image_url && (
            <Image
              alt="Profile Cover"
              src={profile.cover_image_url || ""}
              fill
              className="object-cover "
            />
          )}
        </div>
      </div>
      <div className="relative">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col">
          <UserAvatar user={profile} className="w-32 h-32 border-4 border-background" />
        </div>
      </div>
    </div>
  );
}

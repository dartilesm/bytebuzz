"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import type { Tables } from "database.types";
import { use } from "react";

export interface UserProfileCoverAvatarProps {
  profilePromise: Promise<Tables<"users">>;
}

export function UserProfileCoverAvatar({ profilePromise }: UserProfileCoverAvatarProps) {
  const profile = use(profilePromise);
  return (
    <div>
      <div className="relative w-full aspect-[12/4] overflow-hidden">
        <Image
          alt='Profile Cover'
          src={profile.cover_image_url || ""}
          fill
          className="object-cover"
        />
      </div>
      <div className='relative'>
        <div className='absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col'>
          <Avatar className='w-32 h-32 border-4 border-background'>
            <AvatarImage src={profile.image_url ?? undefined} className="object-cover" />
            <AvatarFallback className="text-4xl">{profile.display_name?.[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

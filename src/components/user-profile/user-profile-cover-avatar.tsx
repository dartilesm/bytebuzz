"use client";

import { Avatar } from "@heroui/react";

import { Image } from "@heroui/react";
import type { Tables } from "database.types";
import { use } from "react";

export interface UserProfileCoverAvatarProps {
  profilePromise: Promise<Tables<"users">>;
}

export function UserProfileCoverAvatar({ profilePromise }: UserProfileCoverAvatarProps) {
  const profile = use(profilePromise);
  return (
    <div>
      <Image
        alt='Profile Cover'
        classNames={{
          wrapper: "w-full max-w-full max-w-full! aspect-[12/4] m-0",
          img: "w-full h-full object-cover object-center m-0 aspect-[11/4] h-auto rounded-t-none",
          blurredImg: "opacity-20",
        }}
        isBlurred
        src={profile.cover_image_url ?? undefined}
      />
      <div className='relative'>
        <div className='absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col'>
          <Avatar
            className='w-32 h-32 text-large'
            src={profile.image_url ?? undefined}
            isBordered
          />
        </div>
      </div>
    </div>
  );
}

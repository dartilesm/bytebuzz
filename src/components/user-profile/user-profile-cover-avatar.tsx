"use client";

import { Avatar } from "@heroui/react";

import { Image } from "@heroui/react";
import { useProfileContext } from "@/hooks/use-profile-context";

export function UserProfileCoverAvatar() {
  const profile = useProfileContext();
  return (
    <div className='relative'>
      <Image
        alt='Profile Cover'
        classNames={{
          wrapper: "w-full max-w-full max-w-full! aspect-[12/4] m-0",
          img: "w-full h-full object-cover object-center m-0 aspect-[11/4] h-auto rounded-t-none",
          blurredImg: "opacity-20",
        }}
        isBlurred
        src='https://heroui.com/images/album-cover.png'
      />
      <div className='absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col'>
        <Avatar className='w-32 h-32 text-large' src={profile.image_url ?? undefined} isBordered />
      </div>
    </div>
  );
}

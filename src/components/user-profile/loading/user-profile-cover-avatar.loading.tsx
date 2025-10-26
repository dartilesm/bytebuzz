"use client";

import { Image, Skeleton } from "@heroui/react";

export function UserProfileCoverAvatarLoading() {
  return (
    <div>
      <Image
        alt='Profile Cover'
        classNames={{
          wrapper: "w-full max-w-full max-w-full! aspect-[12/4] m-0",
          img: "w-full h-full object-cover object-center m-0 aspect-[11/4] h-auto rounded-t-none",
          blurredImg: "opacity-20",
        }}
        isLoading
      />
      <div className='relative'>
        <div className='absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col'>
          <Skeleton className='w-32 h-32 rounded-full' />
        </div>
      </div>
    </div>
  );
}

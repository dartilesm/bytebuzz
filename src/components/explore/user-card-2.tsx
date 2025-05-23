"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { Avatar, Card } from "@heroui/react";
import type { Tables } from "database.types";
import Link from "next/link";

interface UserCardProps {
  user: Tables<"users">;
}

/**
 * A modern user card component with a gradient background and centered layout
 */
export function UserCard2({ user }: UserCardProps) {
  return (
    <Card className="relative rounded-xl overflow-hidden max-w-52 shrink-0">
      {/* Content */}
      <div className="p-6 flex flex-col items-center">
        {/* Avatar */}
        <Link href={`/@${user.username}`} className="block mb-3">
          <Avatar
            src={user.image_url || undefined}
            alt={user.display_name}
            className="size-20"
            isBordered
          />
        </Link>

        {/* User info */}
        <div className="text-center mb-3">
          <Link href={`/@${user.username}`}>
            <div className="flex items-center justify-center gap-1">
              <h3 className="font-semibold text-md hover:underline truncate max-w-2xs">
                {user.display_name}
              </h3>
              <span className="">(@{user.username})</span>
            </div>
          </Link>
          {/* {user.bio && <p className='text-sm mt-1 line-clamp-2'>{user.bio}</p>} */}
        </div>

        {/* Mutual Connections */}
        <div className="flex items-center gap-2 text-xs mb-4">
          <div className="flex -space-x-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-white/20 overflow-hidden"
              >
                <Avatar
                  src={`https://i.pravatar.cc/150?u=mutual${i}`}
                  alt="Mutual connection"
                  className="w-full h-full object-cover"
                  isBordered
                />
              </div>
            ))}
          </div>
          <span>Felipe and {Math.floor(Math.random() * 100)} other mutual connections</span>
        </div>

        {/* Follow button */}
        <FollowButton targetUserId={user.id} />

        {/* Stats */}
        {/* <div className='flex flex-col justify-center mt-4 text-xs'>
          <p>
            <span className='font-semibold text-white'>{user.followers_count}</span> followers
          </p>
          <p>
            <span className='font-semibold text-white'>{user.following_count}</span> following
          </p>
        </div> */}
      </div>
    </Card>
  );
}

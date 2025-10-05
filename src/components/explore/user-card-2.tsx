"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { Avatar, Card, CardBody, CardFooter, cn } from "@heroui/react";
import type { Tables } from "database.types";
import Image from "next/image";
import Link from "next/link";
import type { UrlObject } from "url";

interface UserCardProps {
  user: Tables<"users">;
}

/**
 * A modern user card component with a gradient background and centered layout
 */
export function UserCard2({ user }: UserCardProps) {
  return (
    <Card className='relative rounded-2xl overflow-hidden max-w-[220px] shrink-0 border border-default-200 dark:border-default-100 shadow-xs hover:shadow-sm transition-shadow duration-300 bg-secondary-500/10 dark:bg-secondary-400/10'>
      {/* Gradient Background Accent */}
      <div
        className={cn("absolute top-0 left-0 right-0 h-20 border-b border-default-200", {
          "bg-gradient-to-br from-primary-400/20 via-secondary-400/10 to-transparent":
            !user.cover_image_url,
        })}
      >
        {user.cover_image_url && (
          <Image
            src={user.cover_image_url || ""}
            alt={user.display_name}
            fill
            className='w-full h-full object-cover'
          />
        )}
      </div>

      <CardBody className='p-0' as={Link} href={`/@${user.username}` as unknown as UrlObject}>
        <div className='relative px-5 py-6 flex flex-col items-center gap-4'>
          {/* Avatar with ring */}
          <div className='relative'>
            <Avatar
              src={user.image_url || undefined}
              alt={user.display_name}
              className='size-24 ring-4 ring-background group-hover:scale-105 transition-transform duration-200 border-default-200'
            />
          </div>

          {/* User info */}
          <div className='text-center w-full space-y-1'>
            <h3 className='font-bold text-lg truncate max-w-full group-hover:text-primary transition-colors'>
              {user.display_name}
            </h3>
            <p className='text-sm text-default-500 truncate'>@{user.username}</p>
          </div>

          {/* Stats */}
          <div className='flex gap-6 text-sm w-full justify-center py-2 border-y border-default-200'>
            <div className='text-center'>
              <p className='font-bold text-foreground text-base'>{user.follower_count}</p>
              <p className='text-xs text-default-500'>Followers</p>
            </div>
            <div className='h-auto w-px bg-default-200' />
            <div className='text-center'>
              <p className='font-bold text-foreground text-base'>{user.following_count}</p>
              <p className='text-xs text-default-500'>Following</p>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className='pt-0'>
        {/* Follow button */}
        <div className='w-full'>
          <FollowButton targetUserId={user.id} className='w-full' />
        </div>
      </CardFooter>
    </Card>
  );
}

"use client";

import { UserPostLoading } from "@/components/loading/user-post.loading";

export function UserProfileContentLoading() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 border-b border-default-200 h-10" />
      <div className="py-4 flex flex-col gap-2">
        <UserPostLoading />
        <UserPostLoading />
        <UserPostLoading />
      </div>
    </div>
  );
}

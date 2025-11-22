"use client";

import { UserCard } from "@/components/explore/user-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "database.types";

type UserToFollowListProps = {
  users: Tables<"users">[];
};

export function UserToFollowList({ users }: UserToFollowListProps) {
  return (
    <Card className="shadow-none bg-transparent rounded-none border-0">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-medium">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-2">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </CardContent>
    </Card>
  );
}

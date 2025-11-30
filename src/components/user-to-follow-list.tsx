import { UserHorizontalCard } from "@/components/explore/user-horizontal-card";
import type { Tables } from "database.types";

type UserToFollowListProps = {
  users: Tables<"users">[];
};

/**
 * Renders a list of users to follow using regular divs.
 * @param users - The list of users to display.
 */
export function UserToFollowList({ users }: UserToFollowListProps) {
  return (
    <div className="shadow-none bg-transparent rounded-none border-0 flex flex-col gap-2">
      <div className="px-0 pt-0">
        <div className="text-lg font-medium">Who to follow</div>
      </div>
      <div className="px-0 space-y-2">
        {users.map((user) => (
          <UserHorizontalCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

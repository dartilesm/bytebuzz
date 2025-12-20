import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserProfilePopoverContent } from "@/components/user-profile/user-profile-popover-content";
import { userQueries } from "@/hooks/queries/options/user-queries";

export function Mention({ userId, username }: { userId: string; username: string }) {
  const { data: userData } = useQuery(userQueries.data(userId));

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link
            href={`/@${userData?.username ?? username}`}
            className="mention-link"
            title={`@${userData?.username ?? username}`}
          >
            @{userData?.username ?? username}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <UserProfilePopoverContent user={{ id: userId, username }} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

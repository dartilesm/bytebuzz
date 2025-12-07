import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRoundCheckIcon, UserRoundPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mutationOptions } from "@/hooks/mutation/options/mutation-options";
import { userQueries } from "@/hooks/queries/options/user-queries";
import { useAuthGuard } from "@/hooks/use-auth-guard";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FollowButton({ targetUserId, size = "sm", className }: FollowButtonProps) {
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();
  const isFollowingQuery = userQueries.isFollowing(currentUser?.id, targetUserId);

  const { data: isFollowing, isLoading, isPending } = useQuery(isFollowingQuery);
  const isLoadingFollowStatus = !isPending && isLoading;

  const toggleFollowMutation = useMutation({
    ...mutationOptions.toggleFollow,
    onMutate: async (data) => {
      // Optimistically update the follow status
      queryClient.setQueryData(isFollowingQuery.queryKey, { isFollowing: !isFollowing });
    },
    onSettled: async () => {
      // Invalidate after error or success
      await queryClient.invalidateQueries(isFollowingQuery);
    },
  });

  const { withAuth } = useAuthGuard();

  function handleFollowToggle() {
    toggleFollowMutation.mutate({ target_user_id: targetUserId });
  }

  if (currentUser?.id === targetUserId) return null;

  return (
    <Button
      variant={isFollowing ? "flat" : "default"}
      size={size === "md" ? "default" : size}
      onClick={withAuth(handleFollowToggle)}
      aria-label={
        isLoadingFollowStatus ? "Loading follow status" : isFollowing ? "Following" : "Follow"
      }
      disabled={isLoading}
      className={className}
    >
      {!isLoadingFollowStatus && isFollowing && <UserRoundCheckIcon size={14} />}
      {!isLoadingFollowStatus && !isFollowing && <UserRoundPlusIcon size={14} />}
      {isFollowing && "Following"}
      {!isFollowing && "Follow"}
    </Button>
  );
}

import { useUser } from "@clerk/nextjs";
import { Loader2, UserRoundCheckIcon, UserRoundPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToggleFollowMutation } from "@/hooks/mutation/use-toggle-follow-mutation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useIsFollowing } from "@/hooks/use-is-following";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FollowButton({ targetUserId, size = "sm", className }: FollowButtonProps) {
  const { data: isFollowing, isLoading } = useIsFollowing(targetUserId);
  const toggleFollowMutation = useToggleFollowMutation();

  const [isFollowed, setIsFollowed] = useState(isFollowing);
  const { user: currentUser } = useUser();
  const { withAuth } = useAuthGuard();

  useEffect(() => {
    setIsFollowed(isFollowing);
  }, [isFollowing]);

  function updateFollowStatus(isFollowing: boolean) {
    setIsFollowed(isFollowing);
  }

  function handleFollowToggle() {
    setIsFollowed(!isFollowed);
    toggleFollowMutation.mutate(
      { target_user_id: targetUserId },
      {
        onSuccess(response) {
          if (!response.error) {
            updateFollowStatus(!!response.data);
          }
        },
      },
    );
  }

  if (currentUser?.id === targetUserId) return null;

  return (
    <Button
      variant={isFollowed ? "flat" : "default"}
      size={size === "md" ? "default" : size}
      onClick={withAuth(handleFollowToggle)}
      aria-label={isLoading ? "Loading follow status" : isFollowed ? "Following" : "Follow"}
      disabled={isLoading}
      className={className}
    >
      {!isLoading && isFollowed && <UserRoundCheckIcon size={14} />}
      {!isLoading && !isFollowed && <UserRoundPlusIcon size={14} />}
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowed ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
}

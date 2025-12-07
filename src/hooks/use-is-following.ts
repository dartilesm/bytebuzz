import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/hooks/queries/options/user-queries";

/**
 * React Query hook to check if the current user (from Clerk) is following the target user.
 * Uses Clerk's useUser internally.
 * @param targetUserId - The target user's ID
 * @returns React Query result with isFollowing boolean
 */
export function useIsFollowing(targetUserId: string | undefined) {
  const { userId } = useAuth();

  return useQuery({
    ...userQueries.isFollowing(userId, targetUserId),
    select: (data) => data.isFollowing,
    placeholderData: (data) => data,
  });
}

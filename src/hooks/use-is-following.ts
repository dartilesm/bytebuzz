import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches whether the current user is following the target user.
 * @param targetUserId - The user ID to check if followed by the current user
 * @returns {Promise<{ isFollowing: boolean }>} The follow status
 */
async function fetchIsFollowing(targetUserId: string): Promise<{ isFollowing: boolean }> {
  const res = await fetch(`/api/users/follow-status?targetUserId=${targetUserId}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch follow status");
  }

  return data;
}

/**
 * React Query hook to check if the current user (from Clerk) is following the target user.
 * Uses Clerk's useUser internally.
 * @param targetUserId - The target user's ID
 * @returns React Query result with isFollowing boolean
 */
export function useIsFollowing(targetUserId: string | undefined) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ["is-following", userId, targetUserId],
    queryFn: () => {
      if (!targetUserId) throw new Error("targetUserId is required");
      return fetchIsFollowing(targetUserId);
    },
    enabled: Boolean(targetUserId),
    select: (data) => data.isFollowing,
  });
}

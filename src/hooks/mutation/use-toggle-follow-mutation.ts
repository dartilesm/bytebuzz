import { useUser } from "@clerk/nextjs";
import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ToggleFollowData } from "@/actions/toggle-follow";
import { mutationOptions } from "@/hooks/mutation/options/mutation-options";
import { userQueries } from "@/hooks/queries/options/user-queries";

/**
 * Hook to handle toggling follow status for users
 * @param useMutationProps - Additional mutation options from React Query
 * @returns A mutation object to handle the follow toggle
 */
export function useToggleFollowMutation(
  useMutationProps: UseMutationOptions<
    Awaited<ReturnType<typeof mutationOptions.toggleFollow.mutationFn>>,
    Error,
    ToggleFollowData
  > = {},
) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();
  const mutation = useMutation({
    ...mutationOptions.toggleFollow,
    ...useMutationProps,
    onSuccess: (data, variables, context) => {
      useMutationProps.onSuccess?.(data, variables, context);
      queryClient.invalidateQueries({
        queryKey: userQueries.isFollowing(currentUser?.id, variables.target_user_id).queryKey,
      });
    },
  });

  return mutation;
}

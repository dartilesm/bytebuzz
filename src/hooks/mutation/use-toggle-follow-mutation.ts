import { toggleFollow, ToggleFollowData } from "@/actions/toggle-follow";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
/**
 * Hook to handle toggling follow status for users
 * @param useMutationProps - Additional mutation options from React Query
 * @returns A mutation object to handle the follow toggle
 */
export function useToggleFollowMutation(
  useMutationProps: UseMutationOptions<
    Awaited<ReturnType<typeof toggleFollow>>,
    Error,
    ToggleFollowData
  > = {}
) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();
  const mutation = useMutation({
    ...useMutationProps,
    onSuccess: (data, variables, context) => {
      useMutationProps.onSuccess?.(data, variables, context);
      queryClient.invalidateQueries({
        queryKey: ["isFollowing", currentUser?.id, variables.target_user_id],
      });
    },
    mutationFn: async function (data: ToggleFollowData) {
      const response = await toggleFollow(data);

      if (response.error) {
        throw response.error;
      }

      return response;
    },
  });

  return mutation;
}

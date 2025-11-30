import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type ToggleReactionData, toggleReaction } from "@/actions/toggle-reaction";

/**
 * Hook to handle toggling reactions on posts
 * @param useMutationProps - Additional mutation options from React Query
 * @returns A mutation object to handle the reaction toggle
 */
export function useToggleReactionMutation(
  useMutationProps: UseMutationOptions<
    Awaited<ReturnType<typeof toggleReaction>>,
    Error,
    ToggleReactionData
  > = {},
) {
  const mutation = useMutation({
    ...useMutationProps,
    mutationFn: async (data: ToggleReactionData) => {
      const response = await toggleReaction(data);

      if (response.error) {
        throw response.error;
      }

      return response;
    },
  });

  return mutation;
}

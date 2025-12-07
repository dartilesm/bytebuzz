import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type ToggleReactionData } from "@/actions/toggle-reaction";
import { mutationOptions } from "@/hooks/mutation/options/mutation-options";

/**
 * Hook to handle toggling reactions on posts
 * @param useMutationProps - Additional mutation options from React Query
 * @returns A mutation object to handle the reaction toggle
 */
export function useToggleReactionMutation(
  useMutationProps: UseMutationOptions<
    Awaited<ReturnType<typeof mutationOptions.toggleReaction.mutationFn>>,
    Error,
    ToggleReactionData
  > = {},
) {
  const mutation = useMutation({
    ...mutationOptions.toggleReaction,
    ...useMutationProps,
  });

  return mutation;
}

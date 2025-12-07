import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { mutationOptions, type UpdateProfileWithFilesData } from "@/hooks/mutation/options/mutation-options";

export type { UpdateProfileWithFilesData };

export function useUpdateProfileMutation(
  useMutationProps: UseMutationOptions<
    Awaited<ReturnType<typeof mutationOptions.updateProfile.mutationFn>>,
    Error,
    UpdateProfileWithFilesData
  >,
) {
  const mutation = useMutation({
    ...mutationOptions.updateProfile,
    ...useMutationProps,
  });

  return mutation;
}

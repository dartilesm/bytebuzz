import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/hooks/queries/options/user-queries";

export function useUserDataQuery(userId: string) {
  return useQuery(userQueries.data(userId));
}

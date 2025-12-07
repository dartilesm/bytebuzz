import { useQuery } from "@tanstack/react-query";
import { userQueries, type SearchUsersReturnType } from "@/hooks/queries/options/user-queries";

export function useUsersSearch(searchTerm: string) {
  const usersQuerry = useQuery({
    ...userQueries.search(searchTerm),
    initialData: {
      data: [],
      error: null,
      count: 0,
      status: 200,
      statusText: "OK",
    },
  });

  return usersQuerry;
}

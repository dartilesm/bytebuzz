import { useQuery } from "@tanstack/react-query";
import type { Database } from "database.types";

/**
 * Type for the return value of the search_users RPC, including Supabase contract fields
 * and the correct data type for the search_users result.
 */
type SearchUsersRpcResult = Database["public"]["Functions"]["search_users"]["Returns"];

interface SearchUsersReturnType {
  data: SearchUsersRpcResult;
  error: { message: string } | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

async function getUsers(searchTerm: string) {
  const fetchResponse = await fetch(`/api/users/search?searchTerm=${searchTerm}`);
  const data = (await fetchResponse.json()) as SearchUsersReturnType;

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

export function useUsersSearch(searchTerm: string) {
  const usersQuerry = useQuery<SearchUsersReturnType>({
    queryKey: ["users", searchTerm],
    queryFn: () => getUsers(searchTerm),
    enabled: !!searchTerm,
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

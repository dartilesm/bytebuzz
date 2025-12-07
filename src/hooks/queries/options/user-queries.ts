import { queryOptions } from "@tanstack/react-query";
import type { Database, Tables } from "database.types";

interface ErrorResponse {
  error: string;
}

/**
 * Type for the return value of the search_users RPC, including Supabase contract fields
 * and the correct data type for the search_users result.
 */
type SearchUsersRpcResult = Database["public"]["Functions"]["search_users"]["Returns"];

export interface SearchUsersReturnType {
  data: SearchUsersRpcResult;
  error: { message: string } | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

async function getUserData(userId: string) {
  const fetchResponse = await fetch(`/api/users/${userId}`);
  const data = (await fetchResponse.json()) as Tables<"users"> | ErrorResponse;

  if ("error" in data && typeof data === "object" && data !== null) {
    throw new Error((data as ErrorResponse).error);
  }

  return data as Tables<"users">;
}

async function getUsers(searchTerm: string) {
  const fetchResponse = await fetch(`/api/users/search?searchTerm=${searchTerm}`);
  const data = (await fetchResponse.json()) as SearchUsersReturnType;

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

async function fetchIsFollowing(targetUserId: string): Promise<{ isFollowing: boolean }> {
  const res = await fetch(`/api/users/follow-status?targetUserId=${targetUserId}`);

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      return { isFollowing: false };
    }
    throw new Error(data.error || "Failed to fetch follow status");
  }

  return data;
}

export const userQueries = {
  data: (userId: string) =>
    queryOptions({
      queryKey: ["user-data", userId],
      queryFn: () => getUserData(userId),
      enabled: !!userId,
      staleTime: 60 * 3600 * 1000, // 1 hour
    }),

  search: (searchTerm: string) =>
    queryOptions<SearchUsersReturnType>({
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
    }),

  isFollowing: (userId: string | undefined | null, targetUserId: string | undefined) =>
    queryOptions({
      queryKey: ["is-following", userId, targetUserId],
      queryFn: () => {
        if (!targetUserId) throw new Error("targetUserId is required");
        return fetchIsFollowing(targetUserId);
      },
      enabled: Boolean(targetUserId) && Boolean(userId),
      // Select and placeholder are specific to usage usually, but can be here.
      // Hook had select: (data) => data.isFollowing
      // We will keep select in the hook for now as it transforms the return type.
      staleTime: 60 * 3600 * 1000, // 1 hour
      select: (data) => data.isFollowing,
      placeholderData: (data) => data,
    }),
};

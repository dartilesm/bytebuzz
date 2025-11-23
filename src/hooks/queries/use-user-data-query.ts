import { useQuery } from "@tanstack/react-query";
import type { Tables } from "database.types";

interface ErrorResponse {
  error: string;
}

async function getUserData(userId: string) {
  const fetchResponse = await fetch(`/api/users/${userId}`);
  const data = (await fetchResponse.json()) as Tables<"users"> | ErrorResponse;

  if ("error" in data && typeof data === "object" && data !== null) {
    throw new Error((data as ErrorResponse).error);
  }

  return data as Tables<"users">;
}

export function useUserDataQuery(userId: string) {
  return useQuery({
    queryKey: ["user-data", userId],
    queryFn: () => getUserData(userId),
    enabled: !!userId,
  });
}

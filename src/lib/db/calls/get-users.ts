import { createServerSupabaseClient } from "@/db/supabase";
import type { Database } from "database.types";
import { cache } from "react";

type SearchUsersArgs = Database["public"]["Functions"]["search_users"]["Args"];

type GetUsersParams = {
  searchTerm: SearchUsersArgs["search_term"];
  limitCount?: SearchUsersArgs["limit_count"];
  offsetCount?: SearchUsersArgs["offset_count"];
};

export const getCachedUsers = cache(getUsers);

async function getUsers({ searchTerm, limitCount = 10, offsetCount = 0 }: GetUsersParams) {
  const supabaseClient = createServerSupabaseClient();

  const randomeUnfollwedUsers = await supabaseClient.rpc("search_users", {
    search_term: searchTerm,
    limit_count: limitCount,
    offset_count: offsetCount,
  });

  return randomeUnfollwedUsers;
}

import { createServerSupabaseClient } from "@/db/supabase";
import { cache } from "react";

export const getCachedUsers = cache(getUsers);

async function getUsers(searchTerm: string, limitCount: number = 10) {
  const supabaseClient = createServerSupabaseClient();

  const randomeUnfollwedUsers = await supabaseClient.rpc("search_users", {
    search_term: searchTerm,
    limit_count: limitCount,
  });

  return randomeUnfollwedUsers;
}

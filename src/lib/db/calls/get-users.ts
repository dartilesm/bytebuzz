import { userService } from "@/lib/db/services/user.service";
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
  return await userService.searchUsers({ searchTerm, limitCount, offsetCount });
}

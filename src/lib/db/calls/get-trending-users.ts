import { userService } from "@/lib/db/services/user.service";
import { cache } from "react";

type GetTrendingUsersParams = {
  limitCount?: number;
  offsetCount?: number;
};

export const getCachedTrendingUsers = cache(getTrendingUsers);

async function getTrendingUsers({ limitCount = 10, offsetCount = 0 }: GetTrendingUsersParams = {}) {
  return await userService.getTrendingUsers({ limitCount, offsetCount });
}

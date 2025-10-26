import { withCacheService } from "@/lib/db/with-cache-service";
import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/users/follow_status?targetUserId=xxx
 * Checks if the current user is following the target user.
 * @param req - Next.js request object
 * @returns { isFollowing: boolean }
 */
export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const targetUserId = req.nextUrl.searchParams.get("targetUserId");
  if (!targetUserId) {
    return new Response(JSON.stringify({ error: "Missing targetUserId" }), { status: 400 });
  }

  const { data, error } = await withCacheService("userService", "getFollowStatus")(
    user.id,
    targetUserId
  );
  if (error && error.code !== "PGRST116") {
    // PGRST116 = No rows found, which is not an error for us
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ isFollowing: Boolean(data) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

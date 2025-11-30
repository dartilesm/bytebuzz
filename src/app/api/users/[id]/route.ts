import type { NextRequest } from "next/server";
import { withCacheService } from "@/lib/db/with-cache-service";

/**
 * GET /api/users/[id]
 * Fetches user data by user ID.
 * @param req - Next.js request object
 * @param params - Route parameters containing the user ID
 * @returns User data object
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400 });
  }

  const { data, error } = await withCacheService("userService", "getUserById")(id);
  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 = No rows found
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

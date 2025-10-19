import { feedService } from "@/services/feed.service";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getLogger } from "@/lib/logger";

const log = getLogger(__filename);

/**
 * GET /api/posts/user
 * Fetches posts by a specific username with optional cursor for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = await currentUser();
    const username = user?.username;
    const cursor = searchParams.get("cursor") || undefined;

    if (!username) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await feedService.getUserPosts({ username, cursor });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      success: true,
    });
  } catch (error) {
    log.error({ error }, "Error fetching user posts:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

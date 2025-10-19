import { log } from "@/lib/logger";
import { feedService } from "@/services/feed.service";
import { type NextRequest, NextResponse } from "next/server";


/**
 * GET /api/posts/feed
 * Fetches posts for the user feed with optional cursor for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;

    const result = await feedService.getUserFeed(cursor);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      success: true,
    });
  } catch (error) {
    log.error({ error }, "Error fetching posts:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

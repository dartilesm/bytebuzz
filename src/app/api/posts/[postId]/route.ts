import { type NextRequest, NextResponse } from "next/server";
import { postService } from "@/lib/db/services/post.service";
import { log } from "@/lib/logger/logger";

/**
 * GET /api/posts/[postId]
 * Fetches post thread (ancestry and replies) for a given post ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const result = await postService.getPostThread(postId);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      success: true,
    });
  } catch (error) {
    log.error("Error fetching post thread", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

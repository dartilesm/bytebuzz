import { type NextRequest, NextResponse } from "next/server";
import { postService } from "@/lib/db/services/post.service";
import { log } from "@/lib/logger/logger";

/**
 * GET /api/posts/replies
 * Fetches replies to a post with optional cursor for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor") || undefined;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const result = await postService.getPostReplies({ postId, cursor });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      success: true,
    });
  } catch (error) {
    log.error("Error fetching post replies", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

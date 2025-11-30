import { mediaService } from "@/lib/db/services/media.service";
import { log } from "@/lib/logger/logger";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET handler for media files
 * Proxies requests to Supabase storage and returns the file content
 * Route: /api/media/[userId]/[fileName]
 * Query params:
 * - postId: If provided, searches in posts directory, otherwise searches in temp
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string; fileName: string }> },
) {
  try {
    const { userId, fileName } = await params;
    const { searchParams } = new URL(_request.url);
    const postId = searchParams.get("postId");

    // Define the path and search based on postId presence
    const path = postId ? `${userId}/posts/${postId}` : `${userId}/temp`;

    // Search for the file with caching
    const { data: files } = await mediaService.listFiles("post-images", path, {
      search: fileName,
      limit: 1,
    });

    const matchingFile = files?.[0];

    // Return early if no file found
    if (!matchingFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Download the file with caching
    const { data, error } = await mediaService.downloadFile(
      "post-images",
      `${path}/${matchingFile.name}`,
    );

    if (error || !data) {
      log.error("Error downloading file", { error });
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    // Create response with appropriate headers
    const response = new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": matchingFile.metadata?.mimetype || "application/octet-stream",
        "Content-Disposition": `inline; filename="${matchingFile.name}"`,
        // Add strong ETag for caching
        ETag: `"${matchingFile.name}-${matchingFile.metadata?.size || 0}"`,
        // Cache for 1 year since media files are immutable
        "Cache-Control": "public, max-age=31536000, immutable, stale-while-revalidate=86400",
        // Add Surrogate-Control for CDN caching
        "Surrogate-Control": "public, max-age=31536000, immutable",
        // Add Vary header to respect different client capabilities
        Vary: "Accept-Encoding",
      },
    });

    return response;
  } catch (error) {
    log.error("Error serving media file", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

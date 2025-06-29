import { createServerSupabaseClient } from "@/db/supabase";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET handler for media files
 * Proxies requests to Supabase storage and returns the public URL
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

    const supabase = createServerSupabaseClient();

    // Define the path and search based on postId presence
    const path = postId ? `${userId}/posts/${postId}` : `${userId}/temp`;

    // Search for the file
    const { data: files } = await supabase.storage
      .from("post-images")
      .list(path, { search: fileName, limit: 1 });

    const matchingFile = files?.[0];

    // Return early if no file found
    if (!matchingFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get the public URL
    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(`${path}/${matchingFile.name}`);

    // Return early if no public URL
    if (!data?.publicUrl) {
      return NextResponse.json({ error: "Failed to get public URL" }, { status: 500 });
    }

    // Redirect to the public URL
    return NextResponse.redirect(data.publicUrl, { status: 301 });
  } catch (error) {
    console.error("Error proxying media file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

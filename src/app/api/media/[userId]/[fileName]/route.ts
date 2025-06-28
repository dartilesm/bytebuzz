import { createServerSupabaseClient } from "@/db/supabase";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET handler for media files
 * Proxies requests to Supabase storage and returns the public URL
 * Route: /api/media/[userId]/[fileName]
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

    // First try to find in permanent location (posts folder)
    const { data: permanentFile } = await supabase.storage
      .from("post-images")
      .list(`${userId}/posts/${postId}`, {
        search: fileName,
      });

    // If not found in permanent location, try temp folder
    const { data: tempFile } = await supabase.storage.from("post-images").list(`${userId}/temp`, {
      search: fileName,
    });

    // Get the matching file
    const matchingFile = permanentFile?.[0] || tempFile?.[0];

    if (!matchingFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get the full path based on where we found the file
    const filePath = permanentFile?.[0]
      ? `${userId}/posts/${postId}/${matchingFile.name}`
      : `${userId}/temp/${matchingFile.name}`;

    // Get the public URL
    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);

    if (!data?.publicUrl) {
      return NextResponse.json({ error: "Failed to get public URL" }, { status: 500 });
    }

    // Redirect to the public URL
    return NextResponse.redirect(data.publicUrl);
  } catch (error) {
    console.error("Error proxying media file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { createClient } from "@supabase/supabase-js";

export interface PostThreadData {
  authorName: string;
  authorUsername: string;
  avatarUrl?: string;
  displayContent: string;
  content: string;
  starCount: number;
  coffeeCount: number;
  approveCount: number;
  createdAt: string;
}

// This env vars must be set as an .env file in the supabase folder, or 
// as environment variables in the Supabase project settings
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchPostData(postId: string): Promise<PostThreadData | null> {
  try {
    const { data: postAncestry, error } = await supabase.rpc("get_post_ancestry", {
      start_id: postId,
    });

    if (error || !postAncestry || postAncestry.length === 0) {
      console.error("Error fetching post:", error);
      return null;
    }

    const mainPost = postAncestry[postAncestry.length - 1];
    console.log({ mainPost });
    const author = mainPost.user;
    const authorName = author?.display_name || author?.username || "Unknown User";
    const authorUsername = author?.username || "";
    const avatarUrl = author?.image_url;

    // Clean the post content for display (basic markdown removal)
    const cleanContent = (mainPost.content || "")
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .trim();

    const displayContent =
      cleanContent.length > 200 ? `${cleanContent.substring(0, 500)}...` : cleanContent;

    return {
      authorName,
      authorUsername,
      avatarUrl,
      displayContent,
      content: mainPost.content || "",
      starCount: mainPost.star_count || 0,
      coffeeCount: mainPost.coffee_count || 0,
      approveCount: mainPost.approve_count || 0,
      createdAt: mainPost.created_at || "",
    };
  } catch (error) {
    console.error("Error fetching post data:", error);
    return null;
  }
}

import { createServerSupabaseClient } from "@/db/supabase";
import {
  createUserProfileImage,
  createNotFoundImage,
  twitterImageSize,
  contentType,
  type UserProfileImageData,
} from "@/lib/metadata-image-utils";

// Image metadata
export const size = twitterImageSize;
export { contentType };

/**
 * Generates dynamic Twitter image for user profile pages
 * Shows user avatar, name, username, bio, and follower count
 */
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const formattedUsername = decodeURIComponent(username).replace("@", "");

  // Fetch user data
  const supabaseClient = createServerSupabaseClient();
  const { data: userProfile } = await supabaseClient
    .from("users")
    .select("*")
    .eq("username", formattedUsername)
    .single();

  if (!userProfile) {
    // Fallback image for user not found
    const buffer = createNotFoundImage("user", size);
    return new Response(buffer as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const userData: UserProfileImageData = {
    displayName: userProfile.display_name || userProfile.username,
    username: userProfile.username,
    bio: userProfile.bio || "Developer on ByteBuzz",
    followerCount: userProfile.follower_count || 0,
    avatarUrl: userProfile.image_url,
  };

  // Generate the image
  const buffer = await createUserProfileImage(userData, size);

  return new Response(buffer as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

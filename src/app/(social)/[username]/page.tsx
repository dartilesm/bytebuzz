import { UserProfile } from "@/components/user-profile/user-profile";
import { generateUserProfileMetadata, generateFallbackMetadata } from "@/lib/metadata-utils";
import { withAnalytics } from "@/lib/with-analytics";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { log } from "@/lib/logger/logger";
import { withCacheService } from "@/lib/db/with-cache-service";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

async function getUserProfile(username: string) {
  const formattedUsername = decodeURIComponent(username).replace("@", "");
  const serviceResponse = await withCacheService("userService", "getUserByUsername", {
    cacheLife: "days",
    cacheTags: ["user-profile", username],
  })(formattedUsername);
  return serviceResponse;
}

/**
 * Generates dynamic metadata for user profile pages
 * Includes Open Graph and Twitter Card tags for better social sharing
 */
export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;

  try {
    const { data: userProfile, error } = await getUserProfile(username);

    if (!userProfile || error) {
      return generateFallbackMetadata("user");
    }

    return generateUserProfileMetadata(userProfile);
  } catch (error) {
    log.error("Error generating user profile metadata", { error });
    return generateFallbackMetadata("user");
  }
}

async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const { data: userProfile, error } = await getUserProfile(username);

  if (!userProfile || error) {
    notFound();
  }

  const postsPromise = withCacheService("postService", "getUserPosts", {
    cacheLife: "days",
    cacheTags: ["user-posts", userProfile.username],
  })({ username: userProfile.username });

  return <UserProfile profile={userProfile} postsPromise={postsPromise} />;
}

export default withAnalytics(UserPage, { event: "page-view" });

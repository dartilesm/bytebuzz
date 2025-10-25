import { UserProfile } from "@/components/user-profile/user-profile";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { generateUserProfileMetadata, generateFallbackMetadata } from "@/lib/metadata-utils";
import { withAnalytics } from "@/lib/with-analytics";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { log } from "@/lib/logger/logger";

// Cache user profiles for 1 hour
export const revalidate = 3600;

interface UserPageProps {
  params: Promise<{ username: string }>;
}

/**
 * Generates dynamic metadata for user profile pages
 * Includes Open Graph and Twitter Card tags for better social sharing
 */
export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const formattedUsername = decodeURIComponent(username).replace("@", "");

  try {
    const { data: userProfile, error } = await userRepository.getUserByUsername(formattedUsername);

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
  const formattedUsername = decodeURIComponent(username);
  const { data: userProfile, error } = await userRepository.getUserByUsername(
    formattedUsername.replace("@", "")
  );

  if (!userProfile || error) {
    notFound();
  }

  return <UserProfile profile={userProfile} />;
}

export default withAnalytics(UserPage, { event: "page-view" });

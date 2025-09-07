import { UserProfile } from "@/components/user-profile/user-profile";
import { createServerSupabaseClient } from "@/db/supabase";
import { generateUserProfileMetadata, generateFallbackMetadata } from "@/lib/metadata-utils";
import { withAnalytics } from "@/lib/with-analytics";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

// Cache user profiles for 1 hour
export const revalidate = 3600;

const getUserProfile = cache(async (username: string) => {
  const supabaseClient = createServerSupabaseClient();
  const result = await supabaseClient.from("users").select("*").eq("username", username).single();

  return result;
});

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
    const { data: userProfile, error } = await getUserProfile(formattedUsername);

    if (!userProfile || error) {
      return generateFallbackMetadata("user");
    }

    return generateUserProfileMetadata(userProfile);
  } catch (error) {
    console.error("Error generating user profile metadata:", error);
    return generateFallbackMetadata("user");
  }
}

async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const formattedUsername = decodeURIComponent(username);
  const { data: userProfile, error } = await getUserProfile(formattedUsername.replace("@", ""));

  if (!userProfile || error) {
    notFound();
  }

  return <UserProfile profile={userProfile} />;
}

export default withAnalytics(UserPage, { event: "page-view" });

import { createClient } from "@supabase/supabase-js";

export interface UserProfileData {
  displayName: string;
  username: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  website?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  topTechnologies?: string[];
}

// This env vars must be set as an .env file in the supabase folder, or 
// as environment variables in the Supabase project settings
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseSecretKey = Deno.env.get("SECRET_KEY")!;

const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function fetchUserData(username: string): Promise<UserProfileData | null> {
  try {
    const { data: userProfile, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !userProfile) {
      console.error("Error fetching user:", error);
      return null;
    }
    console.log({ userProfile });

    return {
      displayName: userProfile.display_name || userProfile.username,
      username: userProfile.username,
      bio: userProfile.bio || "Developer on ByteBuzz",
      followerCount: userProfile.follower_count || 0,
      followingCount: userProfile.following_count || 0,
      website: userProfile.website,
      location: userProfile.location,
      githubUrl: userProfile.github_url,
      linkedinUrl: userProfile.linkedin_url,
      avatarUrl: userProfile.image_url,
      coverImageUrl: userProfile.cover_image_url,
      topTechnologies: userProfile.top_technologies,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

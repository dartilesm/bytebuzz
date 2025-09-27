import { createClient } from "@supabase/supabase-js";

interface UserProfileData {
  displayName: string;
  username: string;
  bio: string;
  followerCount: number;
  avatarUrl?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    return {
      displayName: userProfile.display_name || userProfile.username,
      username: userProfile.username,
      bio: userProfile.bio || "Developer on ByteBuzz",
      followerCount: userProfile.follower_count || 0,
      avatarUrl: userProfile.image_url,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

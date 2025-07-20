import { UserProfile } from "@/components/user-profile/user-profile";
import { createServerSupabaseClient } from "@/db/supabase";
import { withAnalytics } from "@/lib/with-analytics";
import { notFound } from "next/navigation";

async function getUserProfile(username: string) {
  const supabaseClient = createServerSupabaseClient();
  const result = await supabaseClient.from("users").select("*").eq("username", username).single();

  return result;
}

interface UserPageProps {
  params: Promise<{ username: string }>;
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

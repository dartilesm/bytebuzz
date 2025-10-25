import { PageHeader } from "@/components/ui/page-header";
import { UserProfileContent } from "@/components/user-profile/user-profile-content";
import { UserProfileCoverAvatar } from "@/components/user-profile/user-profile-cover-avatar";
import { UserProfileDescription } from "@/components/user-profile/user-profile-description";
import { UserProfileTopActions } from "@/components/user-profile/user-profile-top-actions";
import { ProfileProvider } from "@/context/profile-provider";
import { postRepository } from "@/lib/db/repositories";
import type { Tables } from "database.types";

type UserProfileProps = {
  profile: Tables<"users">;
};

export async function UserProfile({ profile }: UserProfileProps) {
  const posts = await postRepository.getUserPosts({ username: profile.username });

  return (
    <ProfileProvider profile={profile}>
      <PageHeader title={profile.display_name} subtitle={`@${profile.username}`} />
      <div className='flex flex-col gap-4 w-full max-w-[1024px] mx-auto px-4'>
        <UserProfileCoverAvatar />
        <UserProfileTopActions />
        <div className='flex flex-col gap-2'>
          <UserProfileDescription />
          <UserProfileContent posts={posts.data ?? []} />
        </div>
      </div>
    </ProfileProvider>
  );
}

import { PageHeader } from "@/components/ui/page-header";
import { UserProfileContent } from "@/components/user-profile/user-profile-content";
import { UserProfileCoverAvatar } from "@/components/user-profile/user-profile-cover-avatar";
import { UserProfileDescription } from "@/components/user-profile/user-profile-description";
import { UserProfileTopActions } from "@/components/user-profile/user-profile-top-actions";
import { ProfileProvider } from "@/context/profile-provider";
import { Suspense } from "react";
import { UserProfileCoverAvatarLoading } from "@/components/user-profile/loading/user-profile-cover-avatar.loading";
import { UserProfileTopActionsLoading } from "@/components/user-profile/loading/user-profile-top-actions.loading";
import { UserProfileDescriptionLoading } from "@/components/user-profile/loading/user-profile-description.loading";
import { UserProfileContentLoading } from "@/components/user-profile/loading/user-profile-content.loading";
import type { Tables } from "database.types";
import type { postService } from "@/lib/db/services/post.service";

type UserProfileProps = {
  profile: Tables<"users">;
  postsPromise: ReturnType<typeof postService.getUserPosts>;
};

export async function UserProfile({ profile, postsPromise }: UserProfileProps) {
  // Create promises for each section to load independently
  const profilePromise = Promise.resolve(profile);

  return (
    <ProfileProvider profile={profile}>
      <PageHeader title={profile.display_name} subtitle={`@${profile.username}`} />
      <div className='flex flex-col gap-2 md:gap-4 w-full max-w-5xl mx-auto px-2 md:px-4'>
        <Suspense fallback={<UserProfileCoverAvatarLoading />}>
          <UserProfileCoverAvatar profilePromise={profilePromise} />
        </Suspense>
        <Suspense fallback={<UserProfileTopActionsLoading />}>
          <UserProfileTopActions profilePromise={profilePromise} />
        </Suspense>
        <div className='flex flex-col gap-2'>
          <Suspense fallback={<UserProfileDescriptionLoading />}>
            <UserProfileDescription profilePromise={profilePromise} />
          </Suspense>
          <Suspense fallback={<UserProfileContentLoading />}>
            <UserProfileContent postsPromise={postsPromise} />
          </Suspense>
        </div>
      </div>
    </ProfileProvider>
  );
}

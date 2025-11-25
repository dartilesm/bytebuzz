import { UserProfileCoverAvatarLoading } from "@/components/user-profile/loading/user-profile-cover-avatar.loading";
import { UserProfileTopActionsLoading } from "@/components/user-profile/loading/user-profile-top-actions.loading";
import { UserProfileDescriptionLoading } from "@/components/user-profile/loading/user-profile-description.loading";
import { UserProfileContentLoading } from "@/components/user-profile/loading/user-profile-content.loading";
import { PageHeader } from "@/components/ui/page-header";

export default function UserPageLoading() {
  return (
    <>
      <PageHeader title='' subtitle='' />
      <div className='flex flex-col gap-4 w-full max-w-5xl mx-auto px-2 md:px-4'>
        <UserProfileCoverAvatarLoading />
        <UserProfileTopActionsLoading />
        <div className='flex flex-col gap-2'>
          <UserProfileDescriptionLoading />
          <UserProfileContentLoading />
        </div>
      </div>
    </>
  );
}

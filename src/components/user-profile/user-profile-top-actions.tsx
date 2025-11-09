"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { LinkedInIcon } from "@/components/ui/icons/LinkedInIcon";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUser } from "@clerk/nextjs";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link2Icon, MoreHorizontalIcon, PencilIcon, Share2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { use, useState } from "react";
import type { Tables } from "database.types";
import { useNavigationContext } from "@/context/navigation-context";

const UserProfileEditModal = dynamic(
  () => import("./user-profile-edit-modal").then((mod) => mod.UserProfileEditModal),
  { ssr: false }
);

export interface UserProfileTopActionsProps {
  profilePromise: Promise<Tables<"users">>;
}

export function UserProfileTopActions({ profilePromise }: UserProfileTopActionsProps) {
  const profile = use(profilePromise);
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const { withAuth } = useAuthGuard();
  const { isMobile } = useNavigationContext();
  const isCurrentUser = user?.username === profile.username;

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    addToast({
      title: "Profile link copied to clipboard",
      color: "success",
    });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${profile.display_name} (@${profile.username})`,
        url: window.location.href,
      });
    } else {
      // Fallback to copy if Web Share API is not available
      handleCopyLink();
    }
  }

  function toggleEditProfileModal() {
    if (isCurrentUser)
      setTimeout(() => {
        // Wait for the modal to close before setting isEditing to true
        setIsEditing(!isEditing);
      }, 500);
  }

  function handleOnSave() {
    setIsEditing(false);
  }

  return (
    <div className='flex justify-between'>
      <div>
        {profile.github_url && (
          <Tooltip content='View GitHub profile' closeDelay={0}>
            <Button
              as='a'
              href={profile.github_url}
              target='_blank'
              rel='noopener noreferrer'
              variant='light'
              aria-label='View GitHub profile'
              isIconOnly
            >
              <SiGithub size={16} />
            </Button>
          </Tooltip>
        )}
        {profile.linkedin_url && (
          <Tooltip content='View LinkedIn profile' closeDelay={0}>
            <Button
              as='a'
              href={profile.linkedin_url}
              target='_blank'
              rel='noopener noreferrer'
              variant='light'
              aria-label='View LinkedIn profile'
              isIconOnly
            >
              <LinkedInIcon size={16} fill='currentColor' />
            </Button>
          </Tooltip>
        )}
      </div>
      <div className='flex flex-row gap-1.5 items-center'>
        <Dropdown placement='left-start'>
          <DropdownTrigger>
            <Button variant='light' aria-label='More options' isIconOnly>
              <MoreHorizontalIcon size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label='Profile actions'>
            <DropdownItem
              key='copy-link'
              onPress={handleCopyLink}
              startContent={<Link2Icon size={16} />}
            >
              Copy profile link
            </DropdownItem>
            <DropdownItem key='share' onPress={handleShare} startContent={<Share2Icon size={16} />}>
              Share profile
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {!isCurrentUser && <FollowButton targetUserId={profile.id} size='md' />}
        {isCurrentUser && (
          <Button
            variant={isMobile ? "light" : "flat"}
            color={isMobile ? "default" : "primary"}
            onPress={withAuth(toggleEditProfileModal)}
            isIconOnly={isMobile}
            startContent={<PencilIcon size={16} />}
          >
            {!isMobile && "Edit profile"}
          </Button>
        )}
      </div>
      {isEditing && (
        <UserProfileEditModal
          onClose={withAuth(toggleEditProfileModal)}
          profile={profile}
          onSave={withAuth(handleOnSave)}
        />
      )}
    </div>
  );
}

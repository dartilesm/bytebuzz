"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { LinkedInIcon } from "@/components/ui/icons/LinkedInIcon";
import { useProfileContext } from "@/hooks/use-profile-context";
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
import { useState } from "react";

const UserProfileEditModal = dynamic(
  () => import("./user-profile-edit-modal").then((mod) => mod.UserProfileEditModal),
  { ssr: false },
);

export function UserProfileTopActions() {
  const { user } = useUser();
  const profile = useProfileContext();
  const [isEditing, setIsEditing] = useState(false);

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
    <div className="flex justify-between">
      <div>
        {profile.github_url && (
          <Tooltip content="View GitHub profile" closeDelay={0}>
            <Button
              as="a"
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              aria-label="View GitHub profile"
              isIconOnly
            >
              <SiGithub size={16} />
            </Button>
          </Tooltip>
        )}
        {profile.linkedin_url && (
          <Tooltip content="View LinkedIn profile" closeDelay={0}>
            <Button
              as="a"
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              aria-label="View LinkedIn profile"
              isIconOnly
            >
              <LinkedInIcon size={16} fill="currentColor" />
            </Button>
          </Tooltip>
        )}
      </div>
      <div className="flex flex-row gap-1.5 items-center">
        <Dropdown placement="left-start">
          <DropdownTrigger>
            <Button variant="light" aria-label="More options" isIconOnly>
              <MoreHorizontalIcon size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile actions">
            <DropdownItem
              key="copy-link"
              onPress={handleCopyLink}
              startContent={<Link2Icon size={16} />}
            >
              Copy profile link
            </DropdownItem>
            <DropdownItem key="share" onPress={handleShare} startContent={<Share2Icon size={16} />}>
              Share profile
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {!isCurrentUser && <FollowButton targetUserId={profile.id} size="md" />}
        {isCurrentUser && (
          <Button
            variant="flat"
            color="primary"
            onPress={toggleEditProfileModal}
            startContent={<PencilIcon size={16} />}
          >
            Edit profile
          </Button>
        )}
      </div>
      {isEditing && (
        <UserProfileEditModal
          onClose={toggleEditProfileModal}
          profile={profile}
          onSave={handleOnSave}
        />
      )}
    </div>
  );
}

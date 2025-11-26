"use client";

import { FollowButton } from "@/components/ui/follow-button";
import { LinkedInIcon } from "@/components/ui/icons/LinkedInIcon";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link2Icon, MoreHorizontalIcon, PencilIcon, PlusIcon, Share2Icon } from "lucide-react";
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
  const hasSocialLinks = profile.github_url || profile.linkedin_url;

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard");
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
      <div className="flex gap-2">
        {profile.github_url && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant='ghost'
                  size='icon'
                  aria-label='View GitHub profile'
                >
                  <a
                    href={profile.github_url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <SiGithub size={16} />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View GitHub profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {profile.linkedin_url && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant='ghost'
                  size='icon'
                  aria-label='View LinkedIn profile'
                >
                  <a
                    href={profile.linkedin_url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <LinkedInIcon size={16} fill='currentColor' />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View LinkedIn profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {isCurrentUser && hasSocialLinks && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='border-dashed border rounded-md text-muted-foreground bg-transparent'
                  onClick={withAuth(toggleEditProfileModal)}
                  aria-label='Add social links'
                >
                  <PlusIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Add social links</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className='flex flex-row gap-1.5 items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' aria-label='More options'>
              <MoreHorizontalIcon size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              key='copy-link'
              onClick={handleCopyLink}
            >
              <Link2Icon size={16} className="mr-2" />
              Copy profile link
            </DropdownMenuItem>
            <DropdownMenuItem key='share' onClick={handleShare}>
              <Share2Icon size={16} className="mr-2" />
              Share profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {!isCurrentUser && <FollowButton targetUserId={profile.id} size='md' />}
        {isCurrentUser && (
          <Button
            variant="default"
            onClick={withAuth(toggleEditProfileModal)}
            size={isMobile ? "icon" : "default"}
          >
            {!isMobile && <PencilIcon size={16} className="ml-2" />}
            {isMobile ? <PencilIcon size={16} /> : "Edit profile"}
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

"use client";

import { SidebarThemeSwitcher } from "@/components/sidebar/sidebar-theme-switcher";
import { Button, Divider } from "@heroui/react";
import { LogOutIcon, SettingsIcon, SunMoonIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useNavigationContext } from "@/context/navigation-context";

interface AccountDropdownContentProps {
  /**
   * Callback function to handle sign out action
   */
  onSignOut: () => void;
  /**
   * Optional callback function to close the dropdown/modal
   * Used for mobile modal to close after navigation
   */
  onClose?: () => void;
}

/**
 * Reusable account dropdown content component
 * Contains profile link, account settings, theme switcher, and sign out actions
 * Used in both desktop sidebar (Popover) and mobile bottom nav (Modal)
 */
export function AccountDropdownContent({ onSignOut, onClose }: AccountDropdownContentProps) {
  const { username } = useNavigationContext();

  function handleNavigationClick() {
    onClose?.();
  }

  return (
    <div className='px-1 py-2 w-full md:max-w-56'>
      {username && (
        <>
          <Button
            as={Link}
            href={`/@${username}`}
            className='w-full justify-start'
            variant='light'
            startContent={<UserIcon size={18} />}
            onPress={handleNavigationClick}
          >
            Profile
          </Button>
          <Divider className='my-2' />
        </>
      )}

      <Button
        as={Link}
        href='/account-settings'
        className='w-full justify-start'
        variant='light'
        startContent={<SettingsIcon size={18} />}
        onPress={handleNavigationClick}
      >
        Account settings
      </Button>

      <Button
        as={"div"}
        className='w-full justify-start mt-1'
        variant='light'
        startContent={<SunMoonIcon size={18} />}
      >
        <span className='flex flex-row justify-between items-center w-full'>
          Theme <SidebarThemeSwitcher />
        </span>
      </Button>

      <Divider className='my-2' />

      <Button
        className='w-full justify-start mt-2'
        color='danger'
        variant='flat'
        startContent={<LogOutIcon size={18} />}
        onPress={() => {
          onSignOut();
          onClose?.();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

"use client";

import { SidebarThemeSwitcher } from "@/components/sidebar/sidebar-theme-switcher";
import { Button, Divider } from "@heroui/react";
import { LogOutIcon, SettingsIcon, SunMoonIcon } from "lucide-react";
import Link from "next/link";

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
 * Contains account settings, theme switcher, and sign out actions
 * Used in both desktop sidebar (Popover) and mobile bottom nav (Modal)
 */
export function AccountDropdownContent({ onSignOut, onClose }: AccountDropdownContentProps) {
  function handleAccountSettingsClick() {
    onClose?.();
  }

  return (
    <div className='px-1 py-2 w-full max-w-56'>
      <Button
        as={Link}
        href='/account-settings'
        className='w-full justify-start'
        variant='light'
        startContent={<SettingsIcon size={18} />}
        onPress={handleAccountSettingsClick}
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

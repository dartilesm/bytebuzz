"use client";

import { LogOutIcon, SettingsIcon, SunMoonIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { SidebarThemeSwitcher } from "@/components/sidebar/sidebar-theme-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <div className="w-full">
      {username && (
        <>
          <Button
            asChild
            className="w-full justify-start"
            variant="ghost"
            onClick={handleNavigationClick}
          >
            <Link href={`/@${username}`}>
              <UserIcon size={18} className="mr-2" />
              Profile
            </Link>
          </Button>
          <Separator className="my-2" />
        </>
      )}

      <Button
        asChild
        className="w-full justify-start"
        variant="ghost"
        onClick={handleNavigationClick}
      >
        <Link href="/account-settings">
          <SettingsIcon size={18} className="mr-2" />
          Account settings
        </Link>
      </Button>

      <div className="w-full flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <SunMoonIcon size={18} />
          Theme
        </span>
        <SidebarThemeSwitcher />
      </div>

      <Separator className="my-2" />

      <Button
        className="w-full justify-start mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        variant="ghost"
        onClick={() => {
          onSignOut();
          onClose?.();
        }}
      >
        <LogOutIcon size={18} className="mr-2" />
        Sign out
      </Button>
    </div>
  );
}

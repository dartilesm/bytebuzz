"use client";

import { useNavigationContext } from "@/context/navigation-context";
import { useAuth } from "@clerk/nextjs";
import { Avatar, Button, Popover, PopoverContent, PopoverTrigger, cn } from "@heroui/react";
import { LogInIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountDropdownContent } from "./account-dropdown-content";
import type { SidebarItemProps } from "./sidebar-item";

type SidebarAccountDropdownProps = Pick<SidebarItemProps, "isActive" | "label">;

export function SidebarAccountDropdown({ isActive, label }: SidebarAccountDropdownProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { user } = useNavigationContext();
  const { signOut } = useAuth();

  if (!user)
    return (
      <Button
        className={cn("w-full px-2 max-xl:px-0 text-left flex justify-between", {
          "bg-content3 dark:bg-content3/50": isActive,
        })}
        variant='light'
        as={Link}
        href='/sign-in'
      >
        <span className='flex items-center gap-2'>
          <UserIcon size={24} />
          Sign in
        </span>
        <LogInIcon size={18} />
      </Button>
    );

  function handleSignOut() {
    signOut();
  }

  function handleClose() {
    setIsPopoverOpen(false);
  }

  return (
    <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} placement='right-start'>
      <PopoverTrigger>
        <Button
          className={cn("flex items-center justify-between w-full", {
            "bg-content3 dark:bg-content3/50": isActive,
            "justify-center px-2 max-xl:px-0": true,
          })}
          variant='light'
          isIconOnly={true}
        >
          <div className={cn("flex items-center w-full", "max-xl:justify-center xl:gap-3")}>
            <Avatar
              src={user?.imageUrl}
              radius='full'
              className='outline-2 outline-content3 size-6'
              classNames={{
                base: "m-0",
              }}
            />
            <span
              className={cn("text-content2-foreground max-xl:hidden xl:inline", {
                "text-content1-foreground": isActive,
              })}
            >
              {label}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <AccountDropdownContent onSignOut={handleSignOut} onClose={handleClose} />
      </PopoverContent>
    </Popover>
  );
}

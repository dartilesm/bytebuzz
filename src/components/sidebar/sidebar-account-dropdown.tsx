"use client";

import { SidebarThemeSwitcher } from "@/components/sidebar/sidebar-theme-switcher";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Avatar,
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@heroui/react";
import { LogOutIcon, SettingsIcon, SunMoonIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { SidebarItemProps } from "./sidebar-item";

type SidebarAccountDropdownProps = Pick<SidebarItemProps, "isActive" | "label">;

export function SidebarAccountDropdown({ isActive, label }: SidebarAccountDropdownProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useAuth();
  return (
    <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} placement="right-start">
      <PopoverTrigger>
        <Button
          className={cn("flex items-center justify-between w-full", {
            "bg-content3 dark:bg-content3/50": isActive,
            "justify-center px-2 max-xl:px-0": true,
          })}
          variant="light"
          isIconOnly={true}
        >
          <div className={cn("flex items-center w-full", "max-xl:justify-center xl:gap-3")}>
            <Avatar
              src={user?.imageUrl}
              radius="full"
              className="outline-2 outline-content3 size-6"
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
        <div className="px-1 py-2 w-full max-w-56">
          <Button
            as={Link}
            href="/account-settings"
            className="w-full justify-start"
            variant="light"
            startContent={<SettingsIcon size={18} />}
          >
            Account settings
          </Button>

          <Button
            as={"div"}
            className="w-full justify-start mt-1"
            variant="light"
            startContent={<SunMoonIcon size={18} />}
          >
            <span className="flex flex-row justify-between items-center w-full">
              Theme <SidebarThemeSwitcher />
            </span>
          </Button>

          <Divider className="my-2" />

          <Button
            className="w-full justify-start mt-2"
            color="danger"
            variant="flat"
            startContent={<LogOutIcon size={18} />}
            onPress={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

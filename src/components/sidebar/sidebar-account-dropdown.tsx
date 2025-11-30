"use client";

import { useNavigationContext } from "@/context/navigation-context";
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LogInIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountDropdownContent } from "@/components/sidebar/account-dropdown-content";
import type { SidebarItemProps } from "@/components/sidebar/sidebar-item";

type SidebarAccountDropdownProps = Pick<SidebarItemProps, "isActive" | "label">;

export function SidebarAccountDropdown({ isActive, label }: SidebarAccountDropdownProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { user } = useNavigationContext();
  const { signOut } = useAuth();

  if (!user)
    return (
      <Button
        className={cn("w-full px-2 max-xl:px-0 text-left flex justify-between", {
          "bg-muted": isActive,
        })}
        variant="ghost"
        asChild
      >
        <Link href="/sign-in">
          <span className="flex items-center gap-2">
            <UserIcon size={24} />
            Sign in
          </span>
          <LogInIcon size={18} />
        </Link>
      </Button>
    );

  function handleSignOut() {
    signOut();
  }

  function handleClose() {
    setIsPopoverOpen(false);
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn("flex items-center justify-between w-full h-auto py-2", {
            "bg-muted": isActive,
            "justify-center px-2 max-xl:px-0": true,
          })}
          variant="ghost"
        >
          <div className={cn("flex items-center w-full", "max-xl:justify-center xl:gap-3")}>
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span
              className={cn("text-muted-foreground max-xl:hidden xl:inline", {
                "text-foreground": isActive,
              })}
            >
              {label}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start">
        <AccountDropdownContent onSignOut={handleSignOut} onClose={handleClose} />
      </PopoverContent>
    </Popover>
  );
}

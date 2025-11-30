"use client";

import { useAuth } from "@clerk/nextjs";
import { UserIcon } from "lucide-react";
import { useState } from "react";
import { AccountDropdownContent } from "@/components/sidebar/account-dropdown-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useNavigationContext } from "@/context/navigation-context";
import { cn } from "@/lib/utils";

interface MobileProfileButtonProps {
  isActive: boolean;
  label: string;
}

/**
 * Mobile profile button component for bottom navigation
 * Displays user avatar and shows account dropdown in bottom modal on click
 */
export function MobileProfileButton({ isActive, label }: MobileProfileButtonProps) {
  const { user } = useNavigationContext();
  const { signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handlePress() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleSignOut() {
    signOut();
  }

  return (
    <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DrawerTrigger asChild>
        <Button
          onClick={handlePress}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-0 flex-1 h-full rounded-none",
            {
              "text-primary": isActive,
              "text-muted-foreground": !isActive,
            },
          )}
          variant="ghost"
          aria-label={label}
        >
          <div className="flex items-center justify-center [&>svg]:size-5">
            {user?.imageUrl ? (
              <Avatar className={cn("size-5", { "ring-2 ring-primary": isActive })}>
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ) : (
              <UserIcon size={20} className={cn({ "text-primary": isActive })} />
            )}
          </div>
          <span className="text-xs">{label}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="pb-6">
          <AccountDropdownContent onSignOut={handleSignOut} onClose={handleCloseModal} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { Avatar, Button, Modal, ModalContent } from "@heroui/react";
import { cn } from "@/lib/utils";
import { useNavigationContext } from "@/context/navigation-context";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { AccountDropdownContent } from "./account-dropdown-content";
import { UserIcon } from "lucide-react";

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
    <>
      <Button
        onPress={handlePress}
        className={cn("flex flex-col items-center justify-center gap-1 min-w-0 flex-1 h-full", {
          "text-primary": isActive,
          "text-default-500": !isActive,
        })}
        variant='light'
        isIconOnly={false}
        aria-label={label}
      >
        <div className='flex items-center justify-center [&>svg]:size-5'>
          {user?.imageUrl ? (
            <Avatar
              src={user.imageUrl}
              radius='full'
              size='sm'
              className={cn("size-5", {
                "ring-2 ring-primary": isActive,
              })}
            />
          ) : (
            <UserIcon size={20} className={cn({ "text-primary": isActive })} />
          )}
        </div>
        <span className='text-xs'>{label}</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        placement='bottom-center'
        scrollBehavior='inside'
        backdrop='opaque'
        hideCloseButton
        classNames={{
          base: "mb-14 rounded-t-2xl",
          wrapper: "items-end px-2",
        }}
      >
        <ModalContent>
          <AccountDropdownContent onSignOut={handleSignOut} onClose={handleCloseModal} />
        </ModalContent>
      </Modal>
    </>
  );
}

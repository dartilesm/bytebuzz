"use client";

import { Avatar, Button, Modal, ModalContent } from "@heroui/react";
import { cn } from "@/lib/utils";
import { useNavigationContext } from "@/context/navigation-context";
import { useAuth } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { AccountDropdownContent } from "./account-dropdown-content";
import { useRouter } from "next/navigation";
import { UserIcon } from "lucide-react";

interface MobileProfileButtonProps {
  href?: string;
  isActive: boolean;
  label: string;
}

/**
 * Mobile profile button component for bottom navigation
 * Displays user avatar and shows account dropdown in bottom modal on long press
 */
export function MobileProfileButton({ href, isActive, label }: MobileProfileButtonProps) {
  const { user } = useNavigationContext();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  function handlePressStart() {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsModalOpen(true);
    }, 500); // 500ms for long press
  }

  function handlePressEnd() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handlePress() {
    // Only navigate if it wasn't a long press
    if (!isLongPressRef.current && href) {
      router.push(href);
    }
    // Reset long press flag after a short delay
    setTimeout(() => {
      isLongPressRef.current = false;
    }, 100);
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
        onPressStart={handlePressStart}
        onPressEnd={handlePressEnd}
        className={cn("flex flex-col items-center justify-center gap-1 min-w-0 flex-1 h-full", {
          "text-primary": isActive,
          "text-default-500": !isActive,
        })}
        variant='light'
        isIconOnly={false}
        aria-label={label}
      >
        <div className='flex items-center justify-center'>
          {user?.imageUrl ? (
            <Avatar
              src={user.imageUrl}
              radius='full'
              size='sm'
              className={cn({
                "ring-2 ring-primary": isActive,
              })}
            />
          ) : (
            <UserIcon size={24} className={cn({ "text-primary": isActive })} />
          )}
        </div>
        <span className='text-xs'>{label}</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        placement='bottom'
        backdrop='blur'
        scrollBehavior='inside'
        classNames={{
          base: "mb-0 rounded-t-2xl",
          wrapper: "items-end",
        }}
      >
        <ModalContent>
          <AccountDropdownContent onSignOut={handleSignOut} onClose={handleCloseModal} />
        </ModalContent>
      </Modal>
    </>
  );
}

"use client";

import { ModalContent, Modal } from "@heroui/react";
import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation";

export default function ModalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  const pathNameWithoutSlash = pathname.replace("/", "");

  function onClose() {
    router.back();
  }

  // Manual exit because Next.js doesn't dismiss the modal when the route changes
  if (!segment?.includes(pathNameWithoutSlash)) {
    return null; // or just render children if you want
  }

  return (
    <Modal
      defaultOpen
      size='xl'
      backdrop='blur'
      scrollBehavior='outside'
      hideCloseButton
      onClose={onClose}
      className='flex justify-center items-center w-min'
      placement='center'
      classNames={{
        base: "max-w-[95vw] md:max-w-xl",
        wrapper: "p-2 md:p-4",
      }}
    >
      <ModalContent>{children}</ModalContent>
    </Modal>
  );
}

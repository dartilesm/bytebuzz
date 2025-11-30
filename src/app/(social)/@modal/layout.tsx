"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ModalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  function handleOnOpenChange(open: boolean) {
    if (!open) {
      setIsOpen(false);
      router.back();
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className='max-w-[95vw] md:max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden'>
        {children}
      </DialogContent>
    </Dialog>
  );
}

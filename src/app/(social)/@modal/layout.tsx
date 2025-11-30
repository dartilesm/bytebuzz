"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ModalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Dialog defaultOpen>
      <DialogContent className="max-w-[95vw] md:max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
        {children}
      </DialogContent>
    </Dialog>
  );
}

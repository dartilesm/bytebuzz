"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
        {children}
      </DialogContent>
    </Dialog>
  );
}

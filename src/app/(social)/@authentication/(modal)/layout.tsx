"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AuthenticationModalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const initialPathnameRef = useRef<string>(pathname);
  const isClosingRef = useRef<boolean>(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    console.log("pathname", pathname);
    console.log("isClosingRef", isClosingRef.current);
    console.log("initialPathnameRef", initialPathnameRef.current);
    console.log("isOpen", isOpen);
    console.log("children", children);
    // If the pathname changes and isClosingRef is true, means the user's clicked outside the modal or intentionally closed it
    // so we need to close the modal by going back to the previous page until we get out from the parallel route
    if (isClosingRef.current) handleOnOpenChange(false);
  }, [pathname]);

  function handleOnOpenChange(open: boolean) {
    console.log("handleOnOpenChange", open); // If the modal is already open, do nothing
    if (open) return;
    // If current pathname is different from the initial pathname, set isClosingRef to true
    // to keep going back until we get out from the parallel route
    if (initialPathnameRef.current !== pathname) isClosingRef.current = true;
    // Go back to the previous page to unmount the parallel route
    router.back();
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
        <Link href="/root">Go back</Link>
        {children}
      </DialogContent>
    </Dialog>
  );
}

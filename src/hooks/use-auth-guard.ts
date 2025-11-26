import { useSession } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { toast } from "sonner";

interface PendingAction {
  fn: (...args: unknown[]) => unknown;
  args: unknown[];
  scrollY: number;
}

export function useAuthGuard() {
  const { isSignedIn } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(resumePendingAction, [isSignedIn, pendingAction]);

  function resumePendingAction() {
    if (!isSignedIn || !pendingAction) return;

    const { fn, args, scrollY } = pendingAction;

    void Promise.resolve(fn(...args)).then(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
      setPendingAction(null);
    });
  }

  function withAuth<T extends (...args: unknown[]) => unknown>(fn: T) {
    return async (...args: Parameters<T>) => {
      if (!isSignedIn) {
        toast.warning("You need to be signed in to do that");
        setPendingAction({
          fn,
          args,
          scrollY: window.scrollY,
        });
        startTransition(() => {
          const redirectUrl = encodeURIComponent(pathname);
          router.push(`/sign-in?redirectUrl=${redirectUrl}`, { scroll: false });
        });
        return;
      }
      return fn(...args);
    };
  }

  return { withAuth };
}

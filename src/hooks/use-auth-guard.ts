import { useSession } from "@clerk/nextjs";
import { addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

interface PendingAction {
  fn: (...args: unknown[]) => unknown;
  args: unknown[];
  scrollY: number;
}

export function useAuthGuard() {
  const { isSignedIn } = useSession();
  const router = useRouter();
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
        addToast({
          title: "You need to be signed in to do that",
          color: "warning",
        });
        setPendingAction({
          fn,
          args,
          scrollY: window.scrollY,
        });
        startTransition(() => {
          router.push("/sign-in", { scroll: false });
        });
        return;
      }
      return fn(...args);
    };
  }

  return { withAuth };
}

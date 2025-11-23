import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { redirect, RedirectType } from "next/navigation";

export function useAuthGuard() {
  const { user } = useUser();

  function withAuth<T extends (...args: unknown[]) => unknown>(fn: T) {
    return async (...args: Parameters<T>) => {
      if (!user) {
        toast.warning("You need to be signed in to do that");
        redirect("/sign-in", RedirectType.push);
      }
      return fn(...args);
    };
  }

  return { withAuth };
}

import { useUser } from "@clerk/nextjs";
import { addToast } from "@heroui/react";
import { redirect } from "next/navigation";

export function useAuthGuard() {
  const { user } = useUser();

  function withAuth<T extends (...args: unknown[]) => unknown>(fn: T) {
    return async (...args: Parameters<T>) => {
      if (!user) {
        addToast({
          title: "You need to be signed in to do that",
          color: "warning",
        });
        redirect("/sign-in");
      }
      return fn(...args);
    };
  }

  return { withAuth };
}

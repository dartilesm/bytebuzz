"use client";

import { useUser } from "@clerk/nextjs";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import type { SerializedUser } from "@/lib/auth/serialize-user";

// User from server (SerializedUser) and client (useUser) have compatible structures
// Both have username, fullName, etc. We use a union type to handle both
type AuthUser = SerializedUser | ReturnType<typeof useUser>["user"] | null;

interface NavigationStateValue {
  user: AuthUser;
  isAuthenticated: boolean;
  username?: string;
  isMobile: boolean;
}

const NavigationStateContext = createContext<NavigationStateValue>({
  user: null,
  isAuthenticated: false,
  username: undefined,
  isMobile: false,
});

interface NavigationContextProviderProps {
  initialUser: SerializedUser | null;
  initialIsMobile: boolean;
  children: ReactNode;
}

/**
 * NavigationContextProvider provides navigation-related state to the application.
 * It accepts initial user and mobile detection from SSR and syncs with Clerk's reactive useUser() hook
 * to ensure the state stays up-to-date on the client.
 * It also handles mobile detection with server-side initial value and client-side enhancement.
 */
export function NavigationContextProvider({
  initialUser,
  initialIsMobile,
  children,
}: NavigationContextProviderProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const clientIsMobile = useMediaQuery("(max-width: 767px)");
  const [isMounted, setIsMounted] = useState(false);

  // Track when component has mounted to transition from server to client value
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadedUser = isLoaded ? clerkUser : initialUser;
  const isAuthenticated = !!loadedUser;
  const username = loadedUser?.username ?? initialUser?.username;

  // Use server value initially, then client value after mount for accuracy
  // This prevents hydration mismatches while maintaining reactivity
  const isMobile = isMounted ? clientIsMobile : initialIsMobile;

  const value: NavigationStateValue = {
    user: loadedUser,
    isAuthenticated,
    username,
    isMobile,
  };

  return (
    <NavigationStateContext.Provider value={value}>{children}</NavigationStateContext.Provider>
  );
}

/**
 * Hook to access navigation context state
 * Returns the current user, authentication status, username, and mobile detection
 */
export function useNavigationContext() {
  return useContext(NavigationStateContext);
}

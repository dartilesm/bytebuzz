"use client";

import { useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useMediaQuery } from "usehooks-ts";
import type { SerializedUser } from "@/lib/auth/serialize-user";

// User from server (SerializedUser) and client (useUser) have compatible structures
// Both have username, fullName, etc. We use a union type to handle both
type AuthUser = SerializedUser | ReturnType<typeof useUser>["user"] | null;

interface AuthContextValue {
  user: AuthUser;
  isAuthenticated: boolean;
  username?: string;
  isMobile: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  username: undefined,
  isMobile: false,
});

interface AuthContextProviderProps {
  initialUser: SerializedUser | null;
  initialIsMobile: boolean;
  children: ReactNode;
}

/**
 * AuthContextProvider provides authentication state to the application.
 * It accepts an initial user from SSR and syncs with Clerk's reactive useUser() hook
 * to ensure the auth state stays up-to-date on the client.
 * It also handles mobile detection with server-side initial value and client-side enhancement.
 */
export function AuthContextProvider({
  initialUser,
  initialIsMobile,
  children,
}: AuthContextProviderProps) {
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

  const value: AuthContextValue = {
    user: loadedUser,
    isAuthenticated,
    username,
    isMobile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Returns the current user, authentication status, and username
 */
export function useAuth() {
  return useContext(AuthContext);
}

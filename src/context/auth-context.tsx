"use client";

import { useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@clerk/nextjs/server";

// User from server (currentUser) and client (useUser) have compatible structures
// Both have username, fullName, etc. We use a union type to handle both
type AuthUser = User | ReturnType<typeof useUser>["user"] | null;

interface AuthContextValue {
  user: AuthUser;
  isAuthenticated: boolean;
  username?: string;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  username: undefined,
});

interface AuthContextProviderProps {
  initialUser: User | null;
  children: ReactNode;
}

/**
 * AuthContextProvider provides authentication state to the application.
 * It accepts an initial user from SSR and syncs with Clerk's reactive useUser() hook
 * to ensure the auth state stays up-to-date on the client.
 */
export function AuthContextProvider({ initialUser, children }: AuthContextProviderProps) {
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<AuthUser>(initialUser);

  // Sync with Clerk's reactive user state
  useEffect(() => {
    if (clerkUser) {
      setUser(clerkUser);
    } else {
      setUser(null);
    }
  }, [clerkUser]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    username: user?.username ?? undefined,
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

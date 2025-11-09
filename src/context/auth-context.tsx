"use client";

import { useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SerializedUser } from "@/lib/auth/serialize-user";

// User from server (SerializedUser) and client (useUser) have compatible structures
// Both have username, fullName, etc. We use a union type to handle both
type AuthUser = SerializedUser | ReturnType<typeof useUser>["user"] | null;

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
  initialUser: SerializedUser | null;
  children: ReactNode;
}

/**
 * AuthContextProvider provides authentication state to the application.
 * It accepts an initial user from SSR and syncs with Clerk's reactive useUser() hook
 * to ensure the auth state stays up-to-date on the client.
 */
export function AuthContextProvider({ initialUser, children }: AuthContextProviderProps) {
  const { user: clerkUser, isLoaded } = useUser();

  const loadedUser = isLoaded ? clerkUser : initialUser;
  const isAuthenticated = !!loadedUser;
  const username = loadedUser?.username ?? initialUser?.username;

  const value: AuthContextValue = {
    user: loadedUser,
    isAuthenticated,
    username,
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

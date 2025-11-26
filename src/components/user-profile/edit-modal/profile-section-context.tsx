"use client";

import type { Tables } from "database.types";
import { createContext, useContext } from "react";

interface ProfileSectionContextValue {
    profile: Tables<"users">;
}

const ProfileSectionContext = createContext<ProfileSectionContextValue | undefined>(
    undefined
);

interface ProfileSectionProviderProps {
    profile: Tables<"users">;
    children: React.ReactNode;
}

/**
 * Provider component that supplies profile data to child section components
 */
export function ProfileSectionProvider({
    profile,
    children,
}: ProfileSectionProviderProps) {
    return (
        <ProfileSectionContext.Provider value={{ profile }}>
            {children}
        </ProfileSectionContext.Provider>
    );
}

/**
 * Hook to access profile data from the ProfileSectionContext
 */
export function useProfileSectionContext() {
    const context = useContext(ProfileSectionContext);
    if (context === undefined) {
        throw new Error(
            "useProfileSectionContext must be used within a ProfileSectionProvider"
        );
    }
    return context;
}


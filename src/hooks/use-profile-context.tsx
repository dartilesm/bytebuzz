"use client";

import { useContext } from "react";
import { ProfileContext } from "@/context/profile-provider";
/**
 * Hook to access the profile context
 */
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}

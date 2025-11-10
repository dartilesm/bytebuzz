import type { User } from "@clerk/nextjs/server";

/**
 * Serialized user data that can be safely passed from Server Components to Client Components.
 * Contains only plain, serializable properties needed for navigation and basic auth state.
 */
export interface SerializedUser {
  id: string;
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  primaryEmailAddress?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

/**
 * Serializes a Clerk User object to a plain, serializable object.
 * Extracts only the essential properties and converts Date objects to ISO strings.
 * This ensures the data can be safely passed from Server Components to Client Components.
 *
 * @param user - The Clerk User object from currentUser() or null
 * @returns A serialized user object or null
 */
export function serializeUser(user: User | null): SerializedUser | null {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username ?? undefined,
    fullName: user.fullName ?? undefined,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    imageUrl: user.imageUrl ?? undefined,
    primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? undefined,
    // Convert Date objects to ISO strings for serialization
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
  };
}


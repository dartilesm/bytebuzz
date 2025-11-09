import type { LucideIcon } from "lucide-react";
import { HomeIcon, MessageSquareIcon, TelescopeIcon, UserIcon } from "lucide-react";

export interface NavigationItem {
  /**
   * The route path for the navigation item
   * Can be a function that takes username and returns the path
   */
  to: string | ((username?: string) => string);
  /**
   * The icon component for the navigation item
   */
  icon: LucideIcon;
  /**
   * The label text for the navigation item
   */
  label: string;
  /**
   * Whether this navigation item requires authentication
   */
  needsAuth?: boolean;
  /**
   * Function to determine if this item is active based on the current pathname
   */
  isActive?: (pathname: string, username?: string) => boolean;
}

/**
 * Base navigation items configuration
 * These are the main navigation items used in both sidebar and mobile bottom nav
 */
export const baseNavigationItems: NavigationItem[] = [
  {
    to: "/root",
    icon: HomeIcon,
    label: "Root",
    needsAuth: false,
    isActive: (pathname) => pathname === "/root",
  },
  {
    to: "/explore",
    icon: TelescopeIcon,
    label: "Explore",
    needsAuth: false,
    isActive: (pathname) => pathname === "/explore",
  },
  {
    to: "/messages",
    icon: MessageSquareIcon,
    label: "Messages",
    needsAuth: true,
    isActive: (pathname) => pathname === "/messages",
  },
  {
    to: (username) => (username ? `/@${username}` : ""),
    icon: UserIcon,
    label: "Profile",
    needsAuth: true,
    isActive: (pathname, username) => {
      if (!username) return false;
      return pathname === `/@${username}`;
    },
  },
];

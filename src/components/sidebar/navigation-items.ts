import type { LucideIcon } from "lucide-react";
import { HomeIcon, MessageSquareIcon, TelescopeIcon, UserIcon } from "lucide-react";
import type { ElementType } from "react";
import Link from "next/link";

export interface NavigationItem {
  /**
   * Component type to render as (e.g., Link). Can be a function that takes username and returns the component type.
   * When provided, the Button will render as this component type.
   */
  as?: ElementType | ((username?: string) => ElementType | null);
  /**
   * Href for Link navigation (when `as={Link}`). Can be a function that takes username and returns the href.
   */
  href?: string | ((username?: string) => string);
  /**
   * Custom click handler function. Can take username as parameter.
   * If both `as`/`href` and `onClick` are provided, `onClick` executes first.
   */
  onClick?: (username?: string) => void;
  /**
   * The icon component for the navigation item
   */
  icon: LucideIcon;
  /**
   * The label text for the navigation item
   */
  label: string;
  /**
   * Whether this navigation item requires authentication.
   * When true and user is unauthenticated, navigation and onClick will be blocked.
   */
  needsAuth?: boolean;
  /**
   * Conditional visibility. Can be a boolean or function that takes username and returns boolean.
   * Items with `isVisible: false` will be filtered out.
   */
  isVisible?: boolean | ((username?: string) => boolean);
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
    as: Link,
    href: "/root",
    icon: HomeIcon,
    label: "Root",
    needsAuth: false,
    isActive: (pathname) => pathname === "/root",
  },
  {
    as: Link,
    href: "/explore",
    icon: TelescopeIcon,
    label: "Explore",
    needsAuth: false,
    isActive: (pathname) => pathname === "/explore",
  },
  {
    as: Link,
    href: "/messages",
    icon: MessageSquareIcon,
    label: "Messages",
    needsAuth: true,
    isActive: (pathname) => pathname === "/messages",
  },
  {
    as: (username?: string) => (username ? Link : null),
    href: (username?: string) => (username ? `/@${username}` : ""),
    icon: UserIcon,
    label: "Profile",
    needsAuth: true,
    isActive: (pathname, username) => {
      if (!username) return false;
      return pathname === `/@${username}`;
    },
  },
];

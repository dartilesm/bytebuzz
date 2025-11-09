import type { LucideIcon } from "lucide-react";
import { HomeIcon, LogInIcon, MessageSquareIcon, TelescopeIcon, UserIcon } from "lucide-react";
import type { ElementType } from "react";
import Link from "next/link";

/**
 * Context object passed to navigation item functions
 * Contains user information, authentication state, and current pathname
 */
export interface NavigationContext {
  username?: string;
  isAuthenticated?: boolean;
  pathname: string;
}

export interface NavigationItem {
  /**
   * Component type to render as (e.g., Link). Can be a function that takes context and returns the component type.
   * When provided, the Button will render as this component type.
   */
  as?: ElementType | ((context: NavigationContext) => ElementType | null);
  /**
   * Href for Link navigation (when `as={Link}`). Can be a function that takes context and returns the href.
   */
  href?: string | ((context: NavigationContext) => string);
  /**
   * Custom click handler function. Receives context object with username and authentication state.
   * If both `as`/`href` and `onClick` are provided, `onClick` executes first.
   */
  onClick?: (context: NavigationContext) => void;
  /**
   * The icon component for the navigation item
   */
  icon: LucideIcon;
  /**
   * The label text for the navigation item
   */
  label: string;
  /**
   * Conditional visibility. Can be a boolean or function that takes context and returns boolean.
   * Items with `isVisible: false` will be filtered out.
   * The context object contains `username`, `isAuthenticated`, and `pathname` properties.
   * Use this to control both visibility and authentication requirements.
   * Example: Show only when authenticated: `isVisible: (context) => context.isAuthenticated === true`
   * Example: Show only when unauthenticated: `isVisible: (context) => context.isAuthenticated === false`
   */
  isVisible?: boolean | ((context: NavigationContext) => boolean);
  /**
   * Function to determine if this item is active based on the current pathname.
   * The pathname is available in the context object.
   */
  isActive?: (context: NavigationContext) => boolean;
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
    isActive: (context) => context.pathname === "/root",
  },
  {
    as: Link,
    href: "/explore",
    icon: TelescopeIcon,
    label: "Explore",
    isActive: (context) => context.pathname === "/explore",
  },
  {
    as: Link,
    href: "/messages",
    icon: MessageSquareIcon,
    label: "Messages",
    isVisible: (context) => context.isAuthenticated === true,
    isActive: (context) => context.pathname === "/messages",
  },
  {
    as: (context: NavigationContext) => (context.username ? Link : null),
    href: (context: NavigationContext) => (context.username ? `/@${context.username}` : ""),
    icon: UserIcon,
    label: "Profile",
    isVisible: (context: NavigationContext) => context.isAuthenticated === true,
    isActive: (context: NavigationContext) => {
      if (!context.username) return false;
      return context.pathname === `/@${context.username}`;
    },
  },
  {
    as: Link,
    href: "/sign-in",
    icon: LogInIcon,
    label: "Sign In",
    isVisible: (context) => context.isAuthenticated === false,
    isActive: (context) => context.pathname === "/sign-in",
  },
];

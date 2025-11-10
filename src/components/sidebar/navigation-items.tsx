import type { LucideIcon } from "lucide-react";
import { HomeIcon, LogInIcon, MessageSquareIcon, TelescopeIcon, UserIcon } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { SidebarAccountDropdown } from "./sidebar-account-dropdown";
import { MobileProfileButton } from "./mobile-profile-button";

/**
 * Context object passed to navigation item functions
 * Contains user information, authentication state, current pathname, and device type
 */
export interface NavigationContext {
  username?: string;
  isAuthenticated?: boolean;
  pathname: string;
  isMobile: boolean;
}

export interface NavigationItem {
  /**
   * Category of the navigation item. Main items appear in both mobile bottom nav and center of desktop sidebar.
   * Secondary items appear at the bottom of the desktop sidebar only.
   * Defaults to "main" for backward compatibility.
   * Can be a static value or a function that takes context and returns the category.
   * Example: `category: (context) => context.isMobile ? "main" : "secondary"`
   */
  category?: "main" | "secondary" | ((context: NavigationContext) => "main" | "secondary");
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
   * The icon component for the navigation item.
   * Can be a static LucideIcon or a function that takes context and returns ReactNode.
   * Useful for conditional icons like showing user avatar when authenticated or different icons for mobile/desktop.
   * Example: `icon: (context) => context.isAuthenticated ? <Avatar src={user.imageUrl} /> : <UserIcon />`
   * Example: `icon: (context) => context.isMobile ? <MobileIcon /> : <DesktopIcon />`
   */
  icon: LucideIcon | ((context: NavigationContext) => ReactNode);
  /**
   * The label text for the navigation item
   */
  label: string;
  /**
   * Conditional visibility. Can be a boolean or function that takes context and returns boolean.
   * Items with `isVisible: false` will be filtered out.
   * The context object contains `username`, `isAuthenticated`, `pathname`, and `isMobile` properties.
   * Use this to control both visibility and authentication requirements.
   * Example: Show only when authenticated: `isVisible: (context) => context.isAuthenticated === true`
   * Example: Show only when unauthenticated: `isVisible: (context) => context.isAuthenticated === false`
   * Example: Show only on mobile: `isVisible: (context) => context.isMobile === true`
   */
  isVisible?: boolean | ((context: NavigationContext) => boolean);
  /**
   * Function to determine if this item is active based on the current pathname.
   * The pathname is available in the context object.
   */
  isActive?: (context: NavigationContext) => boolean;
  /**
   * Custom component render function. When provided, this will be rendered instead of the default SidebarItem.
   * The function receives the computed navigation item and context.
   * Returns ReactNode to override default rendering, or null to use default SidebarItem rendering.
   * Useful for items that need custom rendering logic, like SidebarAccountDropdown.
   * Example: `children: (item, context) => context.isAuthenticated ? <CustomComponent /> : null`
   * Example: `children: (item, context) => context.isMobile ? <MobileComponent /> : <DesktopComponent />`
   */
  children?: (
    item: {
      as?: ElementType | null;
      href?: string;
      onClick?: () => void;
      icon: ReactNode;
      label: string;
      isActive: boolean;
      category?: "main" | "secondary";
    },
    context: NavigationContext
  ) => ReactNode | null;
}

/**
 * Base navigation items configuration
 * These are the main navigation items used in both sidebar and mobile bottom nav
 */
export const baseNavigationItems: NavigationItem[] = [
  {
    category: "main",
    as: Link,
    href: "/root",
    icon: HomeIcon,
    label: "Root",
    isActive: (context) => context.pathname === "/root",
  },
  {
    category: "main",
    as: Link,
    href: "/explore",
    icon: TelescopeIcon,
    label: "Explore",
    isActive: (context) => context.pathname === "/explore",
  },
  {
    category: "main",
    as: Link,
    href: "/messages",
    icon: MessageSquareIcon,
    label: "Messages",
    isVisible: (context) => context.isAuthenticated === true,
    isActive: (context) => context.pathname === "/messages",
  },
  {
    category: "main",
    as: (context: NavigationContext) => (context.username ? Link : null),
    href: (context: NavigationContext) => (context.username ? `/@${context.username}` : ""),
    icon: UserIcon,
    label: "Profile",
    isVisible: (context: NavigationContext) => context.isAuthenticated === true,
    isActive: (context: NavigationContext) => {
      if (!context.username) return false;
      return context.pathname === `/@${context.username}`;
    },
    children: (item, context) => {
      // Render MobileProfileButton for mobile, null for desktop (uses default rendering)
      if (context.isMobile)
        return (
          <MobileProfileButton
            isActive={item.isActive}
            label={item.label}
          />
        );
      return null;
    },
  },
  {
    category: (context: NavigationContext) => (context.isMobile === false ? "secondary" : "main"),
    as: Link,
    href: "/sign-in",
    icon: LogInIcon,
    label: "Sign In",
    isVisible: (context) => context.isAuthenticated === false,
    isActive: (context) => context.pathname === "/sign-in",
  },
  {
    category: "secondary",
    icon: UserIcon,
    label: "", // Label is computed dynamically from user data in the hook
    isVisible: (context) => context.isAuthenticated === true,
    children: (item, _context) => (
      <SidebarAccountDropdown isActive={item.isActive} label={item.label} />
    ),
  },
];

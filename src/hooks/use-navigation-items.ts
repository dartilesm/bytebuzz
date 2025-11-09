import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/components/sidebar/navigation-items";
import { baseNavigationItems } from "@/components/sidebar/navigation-items";
import type { ElementType } from "react";

export interface ComputedNavigationItem {
  as?: ElementType | null;
  href?: string;
  onClick?: () => void;
  icon: NavigationItem["icon"];
  label: string;
  isActive: boolean;
  needsAuth?: boolean;
}

/**
 * Type guard to check if a function is a navigation item function
 * (takes username and returns ElementType | null) vs a component constructor
 */
function isNavigationFunction(
  fn: ElementType | ((username?: string) => ElementType | null)
): fn is (username?: string) => ElementType | null {
  if (typeof fn !== "function") return false;
  // Navigation functions are explicitly typed in our interface
  // We'll check by seeing if calling with undefined returns ElementType | null
  // Component constructors would require props object, not username string
  try {
    const result = (fn as (username?: string) => ElementType | null)(undefined);
    // If it returns null or a function/component type, it's likely a navigation function
    return result === null || typeof result === "function" || typeof result === "string";
  } catch {
    // If it throws, it's likely a component constructor expecting props
    return false;
  }
}

/**
 * Hook to get navigation items with computed values (pathname, username)
 * Returns navigation items with resolved paths and active states
 */
export function useNavigationItems(): ComputedNavigationItem[] {
  const pathname = usePathname();
  const { user } = useUser();
  const username = user?.username ?? undefined;

  const items: ComputedNavigationItem[] = [];

  for (const item of baseNavigationItems) {
    // Compute isVisible
    const isVisible =
      typeof item.isVisible === "function" ? item.isVisible(username) : item.isVisible ?? true;
    if (!isVisible) {
      continue;
    }

    // Compute as (component type)
    // Check if as is a function that takes username, otherwise use it directly
    let as: ElementType | null | undefined;
    if (typeof item.as === "function") {
      if (isNavigationFunction(item.as)) {
        // It's a navigation function - call it with username
        as = item.as(username);
      } else {
        // It's a component constructor - use it directly
        as = item.as as ElementType;
      }
    } else {
      as = item.as;
    }

    // Compute href
    const href = typeof item.href === "function" ? item.href(username) : item.href;

    // If both as and href are missing and no onClick, skip this item
    if (!as && !href && !item.onClick) {
      continue;
    }

    // Pre-bind onClick handler
    const onClick = item.onClick
      ? () => {
          item.onClick?.(username);
        }
      : undefined;

    // Compute isActive
    const isActive = item.isActive
      ? item.isActive(pathname, username)
      : href
      ? pathname === href
      : false;

    items.push({
      as,
      href,
      onClick,
      icon: item.icon,
      label: item.label,
      isActive,
      needsAuth: item.needsAuth,
    });
  }

  return items;
}

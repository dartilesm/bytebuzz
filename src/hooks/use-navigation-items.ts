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

  try {
    const result = (fn as (username?: string) => ElementType | null)(undefined);
    if (result === null) return true;
    if (typeof result === "function") return true;
    if (typeof result === "string") return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Computes the visibility of a navigation item
 */
function computeIsVisible(isVisible: NavigationItem["isVisible"], username?: string): boolean {
  if (typeof isVisible === "function") return isVisible(username);
  if (typeof isVisible === "boolean") return isVisible;
  return true;
}

/**
 * Computes the component type (as prop) for a navigation item
 */
function computeAs(as: NavigationItem["as"], username?: string): ElementType | null | undefined {
  if (typeof as !== "function") return as;
  if (isNavigationFunction(as)) return as(username);
  return as as ElementType;
}

/**
 * Computes the href for a navigation item
 */
function computeHref(href: NavigationItem["href"], username?: string): string | undefined {
  if (typeof href === "function") return href(username);
  return href;
}

/**
 * Creates a pre-bound onClick handler for a navigation item
 */
function createOnClickHandler(
  onClick: NavigationItem["onClick"],
  username?: string
): (() => void) | undefined {
  if (!onClick) return undefined;
  return () => {
    onClick(username);
  };
}

/**
 * Computes the active state of a navigation item
 */
function computeIsActive(
  item: NavigationItem,
  pathname: string,
  href: string | undefined,
  username?: string
): boolean {
  if (item.isActive) return item.isActive(pathname, username);
  if (!href) return false;
  return pathname === href;
}

/**
 * Checks if a navigation item should be included in the result
 */
function shouldIncludeItem(
  as: ElementType | null | undefined,
  href: string | undefined,
  onClick: NavigationItem["onClick"]
): boolean {
  const hasValidNavigation = !!as || !!href || !!onClick;
  if (hasValidNavigation) return true;
  return false;
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
    const isVisible = computeIsVisible(item.isVisible, username);
    if (!isVisible) continue;

    const as = computeAs(item.as, username);
    const href = computeHref(item.href, username);

    if (!shouldIncludeItem(as, href, item.onClick)) continue;

    const onClick = createOnClickHandler(item.onClick, username);
    const isActive = computeIsActive(item, pathname, href, username);

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

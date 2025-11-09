import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import type { NavigationItem, NavigationContext } from "@/components/sidebar/navigation-items";
import { baseNavigationItems } from "@/components/sidebar/navigation-items";
import type { ElementType } from "react";

export interface ComputedNavigationItem {
  as?: ElementType | null;
  href?: string;
  onClick?: () => void;
  icon: NavigationItem["icon"];
  label: string;
  isActive: boolean;
}

/**
 * Type guard to check if a function is a navigation item function
 * (takes context and returns ElementType | null) vs a component constructor
 */
function isNavigationFunction(
  fn: ElementType | ((context: NavigationContext) => ElementType | null)
): fn is (context: NavigationContext) => ElementType | null {
  if (typeof fn !== "function") return false;

  try {
    const emptyContext: NavigationContext = { pathname: "" };
    const result = (fn as (context: NavigationContext) => ElementType | null)(emptyContext);
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
function computeIsVisible(
  isVisible: NavigationItem["isVisible"],
  context: NavigationContext
): boolean {
  if (typeof isVisible === "function") return isVisible(context);
  if (typeof isVisible === "boolean") return isVisible;
  return true;
}

/**
 * Computes the component type (as prop) for a navigation item
 */
function computeAs(
  as: NavigationItem["as"],
  context: NavigationContext
): ElementType | null | undefined {
  if (typeof as !== "function") return as;
  if (isNavigationFunction(as)) return as(context);
  return as as ElementType;
}

/**
 * Computes the href for a navigation item
 */
function computeHref(
  href: NavigationItem["href"],
  context: NavigationContext
): string | undefined {
  if (typeof href === "function") return href(context);
  return href;
}

/**
 * Creates a pre-bound onClick handler for a navigation item
 */
function createOnClickHandler(
  onClick: NavigationItem["onClick"],
  context: NavigationContext
): (() => void) | undefined {
  if (!onClick) return undefined;
  return () => {
    onClick(context);
  };
}

/**
 * Computes the active state of a navigation item
 */
function computeIsActive(
  item: NavigationItem,
  href: string | undefined,
  context: NavigationContext
): boolean {
  if (item.isActive) return item.isActive(context);
  if (!href) return false;
  return context.pathname === href;
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
 * Hook to get navigation items with computed values (context)
 * Returns navigation items with resolved paths and active states
 */
export function useNavigationItems(): ComputedNavigationItem[] {
  const pathname = usePathname();
  const { user } = useUser();

  const context: NavigationContext = {
    username: user?.username ?? undefined,
    isAuthenticated: !!user,
    pathname,
  };

  const items: ComputedNavigationItem[] = [];

  for (const item of baseNavigationItems) {
    const isVisible = computeIsVisible(item.isVisible, context);
    if (!isVisible) continue;

    const as = computeAs(item.as, context);
    const href = computeHref(item.href, context);

    if (!shouldIncludeItem(as, href, item.onClick)) continue;

    const onClick = createOnClickHandler(item.onClick, context);
    const isActive = computeIsActive(item, href, context);

    items.push({
      as,
      href,
      onClick,
      icon: item.icon,
      label: item.label,
      isActive,
    });
  }

  return items;
}

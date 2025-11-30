import { usePathname } from "next/navigation";
import type { ElementType, ReactNode } from "react";
import { createElement } from "react";
import type { NavigationContext, NavigationItem } from "@/components/sidebar/navigation-items";
import { baseNavigationItems } from "@/components/sidebar/navigation-items";
import { useNavigationContext } from "@/context/navigation-context";

export interface ComputedNavigationItem {
  as?: ElementType | null;
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  category?: "main" | "secondary";
  children?: (item: ComputedNavigationItem, context: NavigationContext) => ReactNode | null;
}

/**
 * Type guard to check if a function is a navigation item function
 * (takes context and returns ElementType | null) vs a component constructor
 */
function isNavigationFunction(
  fn: ElementType | ((context: NavigationContext) => ElementType | null),
): fn is (context: NavigationContext) => ElementType | null {
  if (typeof fn !== "function") return false;

  try {
    const emptyContext: NavigationContext = { pathname: "", isMobile: false };
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
  context: NavigationContext,
): boolean {
  if (typeof isVisible === "function") return isVisible(context);
  if (typeof isVisible === "boolean") return isVisible;
  return true;
}

/**
 * Computes the icon for a navigation item
 */
function computeIcon(icon: NavigationItem["icon"], context: NavigationContext): ReactNode {
  if (typeof icon === "function") return icon(context);
  const IconComponent = icon;
  return createElement(IconComponent, { className: "size-5 text-inherit" });
}

/**
 * Computes the component type (as prop) for a navigation item
 */
function computeAs(
  as: NavigationItem["as"],
  context: NavigationContext,
): ElementType | null | undefined {
  if (typeof as !== "function") return as;
  if (isNavigationFunction(as)) return as(context);
  return as as ElementType;
}

/**
 * Computes the href for a navigation item
 */
function computeHref(href: NavigationItem["href"], context: NavigationContext): string | undefined {
  if (typeof href === "function") return href(context);
  return href;
}

/**
 * Creates a pre-bound onClick handler for a navigation item
 */
function createOnClickHandler(
  onClick: NavigationItem["onClick"],
  context: NavigationContext,
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
  context: NavigationContext,
): boolean {
  if (item.isActive) return item.isActive(context);
  if (!href) return false;
  return context.pathname === href;
}

/**
 * Computes the category of a navigation item
 */
function computeCategory(
  category: NavigationItem["category"],
  context: NavigationContext,
): "main" | "secondary" {
  if (typeof category === "function") return category(context);
  if (category === "secondary") return "secondary";
  return "main";
}

/**
 * Checks if a navigation item should be included in the result
 */
function shouldIncludeItem(
  as: ElementType | null | undefined,
  href: string | undefined,
  onClick: NavigationItem["onClick"],
): boolean {
  const hasValidNavigation = !!as || !!href || !!onClick;
  if (hasValidNavigation) return true;
  return false;
}

/**
 * Hook to get navigation items with computed values (context)
 * Returns navigation items separated by category (main and secondary)
 * Main items appear in both mobile bottom nav and center of desktop sidebar
 * Secondary items appear at the bottom of the desktop sidebar only
 */
export function useNavigationItems(): {
  main: ComputedNavigationItem[];
  secondary: ComputedNavigationItem[];
} {
  const pathname = usePathname();
  const { user, isAuthenticated, username, isMobile } = useNavigationContext();

  const context: NavigationContext = {
    username,
    isAuthenticated,
    pathname,
    isMobile,
  };

  const mainItems: ComputedNavigationItem[] = [];
  const secondaryItems: ComputedNavigationItem[] = [];

  for (const item of baseNavigationItems) {
    const isVisible = computeIsVisible(item.isVisible, context);
    if (!isVisible) continue;

    const as = computeAs(item.as, context);
    const href = computeHref(item.href, context);
    const category = computeCategory(item.category, context);

    const computedIcon = computeIcon(item.icon, context);

    // For secondary items with custom children, skip the shouldIncludeItem check
    // since they might not have as/href/onClick but still need to be rendered
    if (category === "secondary" && item.children) {
      const isActive = item.isActive ? item.isActive(context) : false;
      // Compute label dynamically for items that need user data (like SidebarAccountDropdown)
      const computedLabel = item.label || (user?.fullName ?? "");
      const computedItem: ComputedNavigationItem = {
        as,
        href,
        onClick: createOnClickHandler(item.onClick, context),
        icon: computedIcon,
        label: computedLabel,
        isActive,
        category,
        children: item.children,
      };
      secondaryItems.push(computedItem);
      continue;
    }

    if (!shouldIncludeItem(as, href, item.onClick)) continue;

    const onClick = createOnClickHandler(item.onClick, context);
    const isActive = computeIsActive(item, href, context);

    const computedItem: ComputedNavigationItem = {
      as,
      href,
      onClick,
      icon: computedIcon,
      label: item.label,
      isActive,
      category,
      children: item.children,
    };

    if (category === "secondary") {
      secondaryItems.push(computedItem);
      continue;
    }
    mainItems.push(computedItem);
  }

  return {
    main: mainItems,
    secondary: secondaryItems,
  };
}

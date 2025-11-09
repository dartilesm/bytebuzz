"use client";

import type { ComputedNavigationItem } from "@/hooks/use-navigation-items";
import type { NavigationContext } from "./navigation-items";
import type { ReactNode } from "react";

interface NavigationItemRendererProps {
  item: ComputedNavigationItem;
  context: NavigationContext;
  defaultRender: (item: ComputedNavigationItem) => ReactNode;
}

/**
 * Reusable component for rendering navigation items with custom children support
 * Checks if item has custom children render function, and if so, renders it
 * Falls back to default rendering if children returns null or doesn't exist
 */
export function NavigationItemRenderer({
  item,
  context,
  defaultRender,
}: NavigationItemRendererProps) {
  if (item.children) {
    const customRender = item.children(item, context);
    if (customRender !== null) {
      return <div key={item.href || item.label || "navigation-item"}>{customRender}</div>;
    }
    // If children returns null, fall through to default rendering
  }

  return <>{defaultRender(item)}</>;
}


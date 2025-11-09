"use client";

import { Button } from "@heroui/button";
import { cn } from "@/lib/utils";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import { useNavigationContext } from "@/context/navigation-context";
import { usePathname } from "next/navigation";
import type { NavigationContext } from "./navigation-items";

/**
 * Mobile bottom navigation bar for small screens
 * Displays main navigation items in a horizontal layout at the bottom of the screen
 * Items with custom children (like MobileProfileButton) are rendered using their children function
 * Other items use default Button rendering
 */
export function MobileBottomNav() {
  const { main } = useNavigationItems();
  const context = useNavigationContext();
  const pathname = usePathname();

  const navigationContext: NavigationContext = {
    username: context.username,
    isAuthenticated: context.isAuthenticated,
    pathname,
    isMobile: context.isMobile,
  };

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-divider'>
      <div className='flex items-center justify-around h-16 px-2'>
        {main.map((item) => {
          // Check if item has custom children render function
          if (item.children) {
            const customRender = item.children(item, navigationContext);
            if (customRender !== null) {
              return <div key={item.href || item.label}>{customRender}</div>;
            }
            // If children returns null, fall through to default rendering
          }

          // Render items with default Button
          const canNavigate = item.as && item.href;

          return (
            <Button
              key={item.href || item.label}
              as={canNavigate && item.as ? item.as : undefined}
              href={canNavigate ? item.href : undefined}
              onPress={item.onClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-0 flex-1 h-full",
                {
                  "text-primary": item.isActive,
                  "text-default-500": !item.isActive,
                }
              )}
              variant='light'
              isIconOnly={false}
              aria-label={item.label}
            >
              <div className='flex items-center justify-center'>{item.icon}</div>
              <span className='text-xs'>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

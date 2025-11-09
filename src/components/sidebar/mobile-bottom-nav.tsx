"use client";

import { Button } from "@heroui/button";
import { cn } from "@/lib/utils";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import { useNavigationContext } from "@/context/navigation-context";
import { usePathname } from "next/navigation";
import { NavigationItemRenderer } from "./navigation-item-renderer";
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
      <div className='flex items-center justify-around h-12 px-2'>
        {main.map((item) => {
          const canNavigate = item.as && item.href;

          return (
            <NavigationItemRenderer
              key={item.href || item.label}
              item={item}
              context={navigationContext}
              defaultRender={(defaultItem) => (
                <Button
                  as={canNavigate && defaultItem.as ? defaultItem.as : undefined}
                  href={canNavigate ? defaultItem.href : undefined}
                  onPress={defaultItem.onClick}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 min-w-0 flex-1 h-full",
                    {
                      "text-primary": defaultItem.isActive,
                      "text-default-500": !defaultItem.isActive,
                    }
                  )}
                  variant='light'
                  isIconOnly={false}
                  aria-label={defaultItem.label}
                >
                  <div className='flex items-center justify-center [&>svg]:size-5'>
                    {defaultItem.icon}
                  </div>
                  <span className='text-xs'>{defaultItem.label}</span>
                </Button>
              )}
            />
          );
        })}
      </div>
    </nav>
  );
}

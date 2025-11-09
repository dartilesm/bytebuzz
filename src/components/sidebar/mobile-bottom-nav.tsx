"use client";

import Link from "next/link";
import { Button } from "@heroui/button";
import { cn } from "@/lib/utils";
import { useNavigationItems } from "@/hooks/use-navigation-items";

/**
 * Mobile bottom navigation bar for small screens
 * Displays main navigation items in a horizontal layout at the bottom of the screen
 */
export function MobileBottomNav() {
  const navigationItems = useNavigationItems();

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-divider'>
      <div className='flex items-center justify-around h-16 px-2'>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.to}
              as={Link}
              href={item.to}
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
              <Icon size={20} />
              <span className='text-xs'>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

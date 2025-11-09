"use client";

import { Button } from "@heroui/button";
import { cn } from "@/lib/utils";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUser } from "@clerk/nextjs";

/**
 * Mobile bottom navigation bar for small screens
 * Displays main navigation items in a horizontal layout at the bottom of the screen
 */
export function MobileBottomNav() {
  const navigationItems = useNavigationItems();
  const { withAuth } = useAuthGuard();
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-divider'>
      <div className='flex items-center justify-around h-16 px-2'>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const canNavigate = item.as && item.href && (!item.needsAuth || isAuthenticated);

          function handleClick() {
            if (item.needsAuth && item.onClick) return withAuth(item.onClick)();
            if (item.onClick) item.onClick();
          }

          return (
            <Button
              key={item.href || item.label}
              as={canNavigate && item.as ? item.as : undefined}
              href={canNavigate ? item.href : undefined}
              onPress={item.onClick ? handleClick : undefined}
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

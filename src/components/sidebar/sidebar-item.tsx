import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

export interface SidebarItemProps {
  as?: ElementType;
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  label: string | ReactNode;
  isActive?: boolean;
  isExternal?: boolean;
  badge?: string;
}

/**
 * SidebarItem renders a navigation link with an icon and label. Collapsed/expanded state is handled by Tailwind responsive classes.
 */
export function SidebarItem({
  as,
  href,
  onClick,
  icon,
  label,
  isActive,
  isExternal = false,
  badge,
}: SidebarItemProps) {
  // Determine if navigation should be allowed
  const canNavigate = as && href;
  const Component = as || "div";

  return (
    <Button
      variant='ghost'
      asChild={!!canNavigate}
      onClick={onClick}
      className={cn("flex items-center justify-between w-full h-auto py-2", {
        "bg-muted": isActive,
        "justify-center px-2 max-xl:px-0": true,
      })}
    >
      {canNavigate ? (
        <Component
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          <div
            className={cn(
              "flex items-center w-full",
              "max-xl:justify-center xl:gap-3 text-muted-foreground",
              {
                "text-foreground": isActive,
              }
            )}
          >
            {icon}
            {/* Hide label below xl */}
            <span className='flex-1 max-xl:hidden xl:inline text-left'>{label}</span>
          </div>

          {badge && (
            <Badge variant='default' className='max-xl:hidden xl:inline ml-auto'>
              {badge}
            </Badge>
          )}
        </Component>
      ) : (
        <div className='flex items-center w-full justify-between'>
          <div className={cn("flex items-center w-full", "max-xl:justify-center xl:gap-3")}>
            {icon}
            {/* Hide label below xl */}
            <span
              className={cn("text-muted-foreground flex-1 max-xl:hidden xl:inline text-left", {
                "text-foreground": isActive,
              })}
            >
              {label}
            </span>
          </div>
          {badge && (
            <Badge variant='default' className='max-xl:hidden xl:inline ml-auto'>
              {badge}
            </Badge>
          )}
        </div>
      )}
    </Button>
  );
}

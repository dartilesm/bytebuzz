import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Button, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export interface SidebarItemProps {
  to?: string;
  icon: ReactNode;
  label: string | ReactNode;
  isActive?: boolean;
  isExternal?: boolean;
  hasAddButton?: boolean;
  needsAuth?: boolean;
  badge?: string;
}

/**
 * SidebarItem renders a navigation link with an icon and label. Collapsed/expanded state is handled by Tailwind responsive classes.
 */
export function SidebarItem({
  to,
  icon,
  label,
  isActive,
  isExternal = false,
  hasAddButton = false,
  badge,
  needsAuth = false,
}: SidebarItemProps) {
  const { withAuth } = useAuthGuard();

  function handleRedirection() {
    // Fixes RouteImpl type error
    if (to) redirect(to as any);
  }

  const isUnauthenticatedLink = to && !needsAuth;

  return (
    <Button
      as={isUnauthenticatedLink ? Link : undefined}
      href={isUnauthenticatedLink ? to : undefined}
      onPress={isUnauthenticatedLink ? undefined : withAuth(handleRedirection)}
      className={cn("flex items-center justify-between w-full", {
        "bg-content3 dark:bg-content3/50": isActive,
        "justify-center px-2 max-xl:px-0": true,
      })}
      variant='light'
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      // Icon only below xl
      isIconOnly={true}
      tabIndex={0}
      aria-label={typeof label === "string" ? label : undefined}
    >
      <div className={cn("flex items-center w-full", "max-xl:justify-center xl:gap-3")}>
        {icon}
        {/* Hide label below xl */}
        <span
          className={cn("text-content2-foreground flex-1 max-xl:hidden xl:inline text-left", {
            "text-content1-foreground": isActive,
          })}
        >
          {label}
        </span>
      </div>

      {hasAddButton && (
        <button
          className='text-content2-foreground hover:text-content1-foreground transition-colors opacity-0 group-hover:opacity-100 max-xl:hidden xl:inline'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Icon icon='lucide:plus' width={16} height={16} />
        </button>
      )}

      {badge && (
        <Chip color='primary' size='sm' className='max-xl:hidden xl:inline'>
          {badge}
        </Chip>
      )}
    </Button>
  );
}

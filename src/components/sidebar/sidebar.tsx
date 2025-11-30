"use client";

import { BugIcon, ExternalLinkIcon, TriangleIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item";
import { SidebarSection } from "./sidebar-section";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import { useNavigationContext } from "@/context/navigation-context";
import { NavigationItemRenderer } from "./navigation-item-renderer";
import type { NavigationContext } from "@/components/sidebar/navigation-items";

export function Sidebar() {
  const { main, secondary } = useNavigationItems();
  const pathname = usePathname();
  const { username, isAuthenticated, isMobile } = useNavigationContext();

  const context: NavigationContext = {
    username,
    isAuthenticated,
    pathname,
    isMobile,
  };

  // Collapsed if below xl (using Tailwind only)
  // max-xl = below 1280px, xl = 1280px and up
  return (
    <div className="h-full flex flex-col max-xl:max-w-[56px] xl:min-w-56 transition-all duration-200 relative">
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-content1 flex items-center justify-center">
          <TriangleIcon className="text-content1-foreground" size={18} />
        </div>
        {/* Hide label below xl */}
        <span className="font-medium text-content1-foreground text-lg max-xl:hidden xl:inline">
          ByteBuzz
        </span>
      </div>

      <div className="flex-1 overflow-y-auto justify-center flex flex-col">
        <SidebarSection title="">
          {main.map((item) => (
            <NavigationItemRenderer
              key={item.href || item.label}
              item={item}
              context={context}
              defaultRender={(defaultItem) => (
                <SidebarItem
                  as={defaultItem.as ?? undefined}
                  href={defaultItem.href}
                  onClick={defaultItem.onClick}
                  icon={defaultItem.icon}
                  label={defaultItem.label}
                  isActive={defaultItem.isActive}
                />
              )}
            />
          ))}
        </SidebarSection>
      </div>

      <div className="mt-auto py-4">
        <SidebarItem
          as="a"
          href="https://github.com/dartilesm/bytebuzz/issues"
          icon={<BugIcon className="text-default-500 size-5" />}
          label={
            <span className="text-default-500 flex items-center justify-between w-full">
              Bug Report <ExternalLinkIcon className="text-default-500" />
            </span>
          }
          isExternal
        />
        {secondary.map((item) => (
          <NavigationItemRenderer
            key={item.href || item.label || "secondary-item"}
            item={item}
            context={context}
            defaultRender={(defaultItem) => (
              <SidebarItem
                as={defaultItem.as ?? undefined}
                href={defaultItem.href}
                onClick={defaultItem.onClick}
                icon={defaultItem.icon}
                label={defaultItem.label}
                isActive={defaultItem.isActive}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { BugIcon, ExternalLinkIcon, TriangleIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { SidebarItem } from "./sidebar-item";
import { SidebarSection } from "./sidebar-section";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import type { NavigationContext } from "@/components/sidebar/navigation-items";

export function Sidebar() {
  const { main, secondary } = useNavigationItems();
  const pathname = usePathname();
  const { user } = useUser();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const context: NavigationContext = {
    username: user?.username ?? undefined,
    isAuthenticated: !!user,
    pathname,
    isMobile,
  };

  // Collapsed if below xl (using Tailwind only)
  // max-xl = below 1280px, xl = 1280px and up
  return (
    <div className='h-full flex flex-col max-xl:max-w-[56px] xl:min-w-56 transition-all duration-200 relative'>
      <div className='p-4 flex items-center gap-2'>
        <div className='w-8 h-8 rounded-full bg-content1 flex items-center justify-center'>
          <TriangleIcon className='text-content1-foreground' size={18} />
        </div>
        {/* Hide label below xl */}
        <span className='font-medium text-content1-foreground text-lg max-xl:hidden xl:inline'>
          ByteBuzz
        </span>
      </div>

      <div className='flex-1 overflow-y-auto justify-center flex flex-col'>
        <SidebarSection title=''>
          {main.map((item) => {
            if (item.children) {
              const customRender = item.children(item, context);
              if (customRender !== null) {
                return <div key={item.href || item.label}>{customRender}</div>;
              }
              // If children returns null, fall through to default rendering
            }
            return (
              <SidebarItem
                key={item.href || item.label}
                as={item.as ?? undefined}
                href={item.href}
                onClick={item.onClick}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
              />
            );
          })}
        </SidebarSection>

        {/* <SidebarSection title='Organization'>
          <SidebarItem to='/cap-table' icon='lucide:pie-chart' label='Cap Table' isActive={false} />
          <SidebarItem
            to='/analytics'
            icon='lucide:bar-chart-2'
            label='Analytics'
            isActive={false}
          />
          <SidebarItem to='/perks' icon='lucide:gift' label='Perks' isActive={false} badge='3' />
          <SidebarItem to='/expenses' icon='lucide:file-text' label='Expenses' isActive={false} />
          <SidebarItem to='/settings' icon='lucide:settings' label='Settings' isActive={false} />
        </SidebarSection> */}

        {/*         <SidebarSection title='Your Teams'>
          <TeamItem code='HU' name='HeroUI' />
          <TeamItem code='TV' name='Tailwind Variants' />
          <TeamItem code='HP' name='HeroUI Pro' />
        </SidebarSection> */}
      </div>

      <div className='mt-auto py-4'>
        <SidebarItem
          as='a'
          href='https://github.com/dartilesm/bytebuzz/issues'
          icon={<BugIcon size={24} className='text-default-500' />}
          label={
            <span className='text-default-500 flex items-center justify-between w-full'>
              Bug Report <ExternalLinkIcon size={16} className='text-default-500' />
            </span>
          }
          isExternal
        />
        {secondary.map((item) => {
          if (item.children) {
            const customRender = item.children(item, context);
            if (customRender !== null) {
              return <div key={item.href || item.label || "secondary-item"}>{customRender}</div>;
            }
            // If children returns null, fall through to default rendering
          }
          return (
            <SidebarItem
              key={item.href || item.label}
              as={item.as ?? undefined}
              href={item.href}
              onClick={item.onClick}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
            />
          );
        })}
      </div>
    </div>
  );
}

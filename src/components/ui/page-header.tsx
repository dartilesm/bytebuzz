"use client";

import { cn } from "@/lib/utils";
import { Button, Link } from "@heroui/react";
import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { log } from "@/lib/logger/logger";

type PageHeaderProps = {
  /**
   * The main title to display in the header
   */
  title?: string;
  /**
   * Optional subtitle to display below the title
   */
  subtitle?: string;
  /**
   * Optional right side content
   */
  rightContent?: ReactNode;
  /**
   * Whether to show the back button
   * @default true
   */
  showBackButton?: boolean;
  /**
   * Custom back link
   * @default window.history.back
   */
  backLink?: string;
  /**
   * Optional content to display next to the back button
   */
  children?: ReactNode;
  /**
   * Optional custom class name
   */
  className?: string;
};

/**
 * PageHeader component that provides a consistent header across pages
 * with optional back button, title, subtitle, and right content
 */
export function PageHeader({
  title,
  subtitle,
  rightContent,
  showBackButton = true,
  backLink = "/root",
  children,
  className,
}: PageHeaderProps) {
  /*   const router = useRouter();

  function handleBack() {
    const previousUrl = document.referrer;
    log.info("Previous URL", { previousUrl });
    router.back();
  } */

  return (
    <header className={cn("sticky top-0 z-40 backdrop-blur-xl bg-background/70", className)}>
      <div className='container flex items-center h-16'>
        <div className='flex items-center gap-2 flex-1'>
          <div className='flex items-center gap-2'>
            {showBackButton && (
              <Button as={Link} href={backLink} isIconOnly variant='light' aria-label='Go back'>
                <ArrowLeftIcon className='w-5 h-5' />
              </Button>
            )}
          </div>
          {Boolean(children) && children}
          {!children && (
            <div className='flex flex-col'>
              <h1 className='text-lg font-semibold leading-none'>{title}</h1>
              {subtitle && <p className='text-sm text-default-500'>{subtitle}</p>}
            </div>
          )}
        </div>
        {rightContent && <div className='flex items-center gap-2'>{rightContent}</div>}
      </div>
    </header>
  );
}

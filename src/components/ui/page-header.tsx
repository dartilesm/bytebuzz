"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <header className={cn("sticky top-0 z-40 dark:bg-background bg-background", className)}>
      <div className="container flex items-center h-14 md:h-16 px-2 md:px-4">
        <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1 md:gap-2">
            {showBackButton && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Go back"
                className="min-w-[44px] min-h-[44px]"
              >
                <Link href={backLink as any}>
                  <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
            )}
          </div>
          {Boolean(children) && children}
          {!children && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-base md:text-lg font-semibold leading-none truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-default-500 truncate">{subtitle}</p>
              )}
            </div>
          )}
        </div>
        {rightContent && (
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">{rightContent}</div>
        )}
      </div>
    </header>
  );
}

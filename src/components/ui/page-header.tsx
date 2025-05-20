"use client";

import { Button, Link } from "@heroui/react";
import { ArrowLeftIcon } from "lucide-react";
import { ReactNode } from "react";

type PageHeaderProps = {
  /**
   * The main title to display in the header
   */
  title: string;
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
}: PageHeaderProps) {
  /*   const router = useRouter();

  function handleBack() {
    const previousUrl = document.referrer;
    console.log("previousUrl", previousUrl);
    router.back();
  } */

  return (
    <header className='sticky top-0 z-40 backdrop-blur-xl bg-background/70'>
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

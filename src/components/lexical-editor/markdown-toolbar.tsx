"use client";

import { useMarkdownContext } from "@/components/lexical-editor/markdown-provider";
import { MarkdownToolbarDefaultActions } from "@/components/lexical-editor/markdown-toolbar-default-actions";
import { cn } from "@/lib/utils";

interface MarkdownToolbarProps {
  /**
   * Additional CSS classes for the toolbar
   */
  className?: string;
  /**
   * Additional CSS classes for the buttons (only applied to default actions)
   */
  buttonClassName?: string;
  /**
   * Custom toolbar content. If provided, completely overrides default actions.
   */
  children?: React.ReactNode;
}

/**
 * Toolbar component for the markdown editor
 *
 * Must be used within a MarkdownProvider
 *
 * If children are provided, they completely override the default toolbar actions.
 * If no children are provided, renders the default toolbar actions.
 */
export function MarkdownToolbar({ className, buttonClassName, children }: MarkdownToolbarProps) {
  // Ensure we're within the provider context
  useMarkdownContext();

  return (
    <div
      className={cn(
        "flex items-center justify-start gap-2 p-2 border-t border-default-200 bg-default-50",
        className,
      )}
    >
      {children ? children : <MarkdownToolbarDefaultActions buttonClassName={buttonClassName} />}
    </div>
  );
}

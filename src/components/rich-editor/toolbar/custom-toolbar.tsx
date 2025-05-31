"use client";

import { MentionPickerWrapper } from "@/components/rich-editor/plugins/mentions/components/mention-picker-wrapper";
import { CodeBlockButton } from "@/components/rich-editor/toolbar/code-block-button";
import type { ReactNode } from "react";

type CustomToolbarProps = {
  children?: ReactNode;
};

/**
 * Custom toolbar component with Insert Code Block button and optional children override
 * If children are provided, they completely replace the default toolbar content
 */
export function CustomToolbar({ children }: CustomToolbarProps) {
  // If children are provided, render only the children (complete override)
  if (children) {
    return (
      <div className="flex items-center gap-2">
        {/* This is not a physical button, it's a wrapper for the mention picker.
      It is here to get the editor context to work properly. */}
        <MentionPickerWrapper />
        {children}
      </div>
    );
  }

  // Default toolbar content when no children are provided
  return (
    <div className="flex items-center gap-2">
      <CodeBlockButton />

      {/* This is not a physical button, it's a wrapper for the mention picker.
      It is here to get the editor context to work properly. */}
      <MentionPickerWrapper />
    </div>
  );
}

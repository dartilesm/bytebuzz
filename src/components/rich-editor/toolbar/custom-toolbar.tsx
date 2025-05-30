"use client";

import { MentionPickerWrapper } from "@/components/rich-editor/plugins/mentions/components/mention-picker-wrapper";
import { CodeBlockButton } from "@/components/rich-editor/toolbar/code-block-button";
import type { ReactNode } from "react";
import { Fragment } from "react";

type CustomToolbarProps = {
  customActions?: ReactNode[];
};

/**
 * Custom toolbar component with Insert Code Block button and optional custom actions
 */
export function CustomToolbar({ customActions }: CustomToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <CodeBlockButton />
      {/* Render custom actions if provided */}
      {customActions?.map((action, index) => (
        <Fragment key={`action-${Date.now()}-${index}`}>{action}</Fragment>
      ))}

      {/* This is not a physical button, it's a wrapper for the mention picker.
      It is here to get the editor context to work properly. */}
      <MentionPickerWrapper />
    </div>
  );
}

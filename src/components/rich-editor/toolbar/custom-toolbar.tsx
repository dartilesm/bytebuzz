"use client";

import { MentionPickerWrapper } from "@/components/rich-editor/plugins/mentions/components/mention-picker-wrapper";
import { CodeBlockButton } from "@/components/rich-editor/toolbar/code-block-button";
import { ImageButton } from "@/components/rich-editor/toolbar/image-button";

/**
 * Custom toolbar component with Insert Code Block button
 */
export function CustomToolbar() {
  return (
    <div className="flex items-center gap-2">
      <CodeBlockButton />

      <ImageButton />

      {/* This is not a physical button, it's a wrapper for the mention picker.
      It is here to get the editor context to work properly. */}
      <MentionPickerWrapper />
    </div>
  );
}

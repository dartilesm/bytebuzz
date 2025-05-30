"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/react";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import type { RefObject } from "react";
import { DismissibleImage } from "./dismissible-image";

const RichEditor = dynamic(() => import("./rich-editor").then((mod) => mod.RichEditor));

interface RichPostComposerProps extends Omit<MDXEditorProps, "ref" | "markdown"> {
  ref?: RefObject<MDXEditorMethods>;
  markdown?: string;
}

export function RichPostComposer({ markdown = "", ref }: RichPostComposerProps) {
  const { user } = useUser();

  /**
   * Handles the image dismissal
   */
  function handleImageDismiss() {
    // TODO: Implement image removal logic
    console.log("Image dismissed");
  }

  return (
    <div className="dark:bg-default-100 bg-default-100 dark:hover:bg-default-200 hover:bg-default-200 rounded-xl flex flex-row gap-4 overflow-hidden min-h-24 p-4">
      <div className="flex flex-row gap-2 z-10">
        <Avatar isBordered src={user?.imageUrl} />
      </div>
      <div className="flex-1 flex flex-col gap-2 relative pb-12">
        <RichEditor
          markdown={markdown}
          containerClassName="flex-1"
          contentEditableClassName="pb-0"
          className="static"
          editorRef={ref || null}
          placeholder="What's on your mind?"
        />
        <DismissibleImage
          src="https://placehold.co/600x400"
          alt="placeholder"
          onDismiss={handleImageDismiss}
        />
      </div>
    </div>
  );
}

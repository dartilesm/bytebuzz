"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/react";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import type { RefObject } from "react";

const RichEditor = dynamic(() => import("./rich-editor").then((mod) => mod.RichEditor));

interface RichPostComposerProps extends Omit<MDXEditorProps, "ref" | "markdown"> {
  ref?: RefObject<MDXEditorMethods>;
  markdown?: string;
}

export function RichPostComposer({ markdown = "", ref }: RichPostComposerProps) {
  const { user } = useUser();

  return (
    <div className="dark:bg-default-100 bg-default-100 dark:hover:bg-default-200 hover:bg-default-200 rounded-xl flex flex-row gap-4 overflow-hidden min-h-24 p-4">
      <div className="flex flex-row gap-2 z-10">
        <Avatar isBordered src={user?.imageUrl} />
      </div>
      <RichEditor
        markdown={markdown}
        containerClassName="flex-1"
        editorRef={ref || null}
        placeholder="What's on your mind?"
      />
    </div>
  );
}

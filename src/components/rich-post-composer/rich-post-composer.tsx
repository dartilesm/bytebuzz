"use client";

import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import type { RefObject } from "react";

const RichEditor = dynamic(() => import("./rich-editor").then((mod) => mod.RichEditor));

interface RichPostComposerProps extends Omit<MDXEditorProps, "ref" | "markdown"> {
  ref?: RefObject<MDXEditorMethods>;
  markdown?: string;
}

export function RichPostComposer({ markdown = "", ref }: RichPostComposerProps) {
  return (
    <RichEditor
      markdown={markdown}
      contentEditableClassName="prose"
      editorRef={ref || null}
      placeholder="What's on your mind?"
    />
  );
}

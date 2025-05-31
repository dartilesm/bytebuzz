"use client";

import { CodeBlockButton } from "@/components/rich-editor/toolbar/code-block-button";
import { ImageButton } from "@/components/rich-editor/toolbar/image-button";
import { useUser } from "@clerk/nextjs";
import { Avatar, Button } from "@heroui/react";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { DismissibleImage } from "./dismissible-image";

const RichEditor = dynamic(() => import("./rich-editor").then((mod) => mod.RichEditor));

interface RichPostComposerProps extends Omit<MDXEditorProps, "ref" | "markdown"> {
  markdown?: string;
}

export function RichPostComposer({ markdown = "" }: RichPostComposerProps) {
  const editorRef = useRef<MDXEditorMethods>({} as MDXEditorMethods);
  const { user } = useUser();

  /**
   * Handles the image dismissal
   */
  function handleImageDismiss() {
    // TODO: Implement image removal logic
    console.log("Image dismissed");
  }

  /**
   * Handles the post submission by logging the current editor content
   */
  function handlePost() {
    if (editorRef.current) {
      const content = editorRef.current.getMarkdown();
      console.log("Editor content:", content);
    } else {
      console.log("Editor ref not available");
    }
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
          editorRef={editorRef}
          placeholder="What's on your mind?"
        >
          <div className="flex flex-row gap-2 justify-between flex-1">
            <div className="flex flex-row gap-2">
              <CodeBlockButton />
              <ImageButton />
            </div>
            <Button variant="flat" color="primary" size="sm" onPress={handlePost}>
              Post
            </Button>
          </div>
        </RichEditor>
        <DismissibleImage
          src="https://placehold.co/600x400"
          alt="placeholder"
          onDismiss={handleImageDismiss}
        />
      </div>
    </div>
  );
}

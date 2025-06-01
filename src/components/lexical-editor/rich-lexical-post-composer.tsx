"use client";

import { MarkdownProvider } from "@/components/lexical-editor/markdown-provider";
import { MarkdownEditor } from "@/components/lexical-editor/markdown-editor";
import { MarkdownToolbar } from "@/components/lexical-editor/markdown-toolbar";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/avatar";
import type { EditorState } from "lexical";

export function RichLexicalPostComposer() {
  const { user } = useUser();

  function handleContentChange(markdown: string, editorState: EditorState) {
    console.log(markdown, editorState);
  }

  return (
    <div className="dark:bg-default-100 bg-default-100 dark:hover:bg-default-200 hover:bg-default-200 rounded-xl overflow-hidden min-h-24 group/post-composer">
      <MarkdownProvider onChange={handleContentChange} enableMentions>
        <div className="flex flex-row gap-4 p-4">
          <div className="flex flex-row gap-2 z-10">
            <Avatar isBordered src={user?.imageUrl} />
          </div>
          <div className="flex-1">
            <MarkdownEditor
              placeholder="Start typing with markdown shortcuts..."
              contentClassName="min-h-12 p-0"
              autoFocus
            />
            <MarkdownToolbar
              className="bg-transparent border-none p-0"
              buttonClassName="bg-default-transparent duration-0 hover:bg-default-300 focus-visible:ring-2 focus-visible:ring-default-300 focus-visible:ring-primary"
            />
          </div>
        </div>
      </MarkdownProvider>
    </div>
  );
}

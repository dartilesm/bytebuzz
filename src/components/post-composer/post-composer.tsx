"use client";

import {
  MarkdownProvider,
  useMarkdownContext,
} from "@/components/lexical-editor/markdown-provider";
import { MarkdownEditor } from "@/components/lexical-editor/markdown-editor";
import { MarkdownToolbar } from "@/components/lexical-editor/markdown-toolbar";
import { MarkdownToolbarDefaultActions } from "@/components/lexical-editor/markdown-toolbar-default-actions";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Send } from "lucide-react";
import type { EditorState } from "lexical";
import { editorStateToMarkdown } from "@/components/lexical-editor/functions/markdown-utils";

/**
 * Custom submit button component that uses the markdown context
 */
function SubmitButton() {
  const { editorRef } = useMarkdownContext();
  function handleSubmit() {
    let markdown = "";
    editorRef?.current?.getEditorState().read(() => {
      const editor = editorRef.current;
      if (editor) {
        markdown = editorStateToMarkdown(editor.getEditorState());
      }
    });
    console.log("Submitting markdown:", markdown);

    // Here you would typically send the markdown to your API
    // For demo purposes, we'll just log it
    if (markdown.trim()) {
      alert(`Post content:\n\n${markdown}`);
    } else {
      alert("Please write something before posting!");
    }
  }

  return (
    <Button
      color="primary"
      size="sm"
      onPress={handleSubmit}
      className="ml-auto"
      startContent={<Send size={16} />}
      type="submit"
    >
      Post
    </Button>
  );
}

export function PostComposer() {
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
            <MarkdownToolbar className="bg-transparent border-none p-0">
              <MarkdownToolbarDefaultActions buttonClassName="bg-default-transparent duration-0 hover:bg-default-300 focus-visible:ring-2 focus-visible:ring-default-300 focus-visible:ring-primary" />
              <SubmitButton />
            </MarkdownToolbar>
          </div>
        </div>
      </MarkdownProvider>
    </div>
  );
}

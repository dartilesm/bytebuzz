"use client";

import { MarkdownEditor } from "@/components/lexical-editor/markdown-editor";
import { MarkdownProvider } from "@/components/lexical-editor/markdown-provider";
import { MarkdownToolbar } from "@/components/lexical-editor/markdown-toolbar";
import { MarkdownToolbarDefaultActions } from "@/components/lexical-editor/markdown-toolbar-default-actions";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EditorState } from "lexical";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const postComposerSchema = z.object({
  content: z.string().min(1),
});

export function PostComposer() {
  const { user } = useUser();
  const form = useForm<z.infer<typeof postComposerSchema>>({
    resolver: zodResolver(postComposerSchema),
    defaultValues: {
      content: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    form.register("content");
  }, []);

  function handleContentChange(markdown: string, editorState: EditorState) {
    form.setValue("content", markdown);
    form.trigger("content");
  }

  function onSubmit(data: z.infer<typeof postComposerSchema>) {
    console.log(data);
  }

  return (
    <form
      className="dark:bg-default-100 bg-default-100 dark:hover:bg-default-200 hover:bg-default-200 rounded-xl overflow-hidden min-h-24 group/post-composer"
      onSubmit={form.handleSubmit(onSubmit)}
    >
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
              <Button
                type="submit"
                color="primary"
                size="sm"
                className="ml-auto"
                isDisabled={!form.formState.isValid}
              >
                Post
              </Button>
            </MarkdownToolbar>
          </div>
        </div>
      </MarkdownProvider>
    </form>
  );
}

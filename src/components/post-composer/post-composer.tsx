"use client";

import { MarkdownEditor } from "@/components/lexical-editor/markdown-editor";
import { MarkdownProvider } from "@/components/lexical-editor/markdown-provider";
import { MarkdownToolbar } from "@/components/lexical-editor/markdown-toolbar";
import { MarkdownToolbarDefaultActions } from "@/components/lexical-editor/markdown-toolbar-default-actions";
import { useCreatePostMutation } from "@/hooks/mutation/use-create-post-mutation";
import { usePostsContext } from "@/hooks/use-posts-context";
import type { NestedPost } from "@/types/nested-posts";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LexicalEditor } from "lexical";
import { $getRoot } from "lexical";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const postComposerSchema = z.object({
  content: z.string().min(1),
});

type PostComposerProps = {
  onSubmit?: () => void;
};

export function PostComposer({ onSubmit: onSubmitProp }: PostComposerProps) {
  const { user } = useUser();
  const { addPost } = usePostsContext();
  const editorRef = useRef<LexicalEditor>({} as LexicalEditor);
  const form = useForm<z.infer<typeof postComposerSchema>>({
    resolver: zodResolver(postComposerSchema),
    defaultValues: {
      content: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const { mutate, isPending } = useCreatePostMutation(
    {
      onError: (error) => {
        form.setError("content", { message: error.message });
        console.error(error);
      },
      onSettled: (response) => {
        if (response?.data) {
          const newPost: NestedPost = {
            ...response.data,
            user: {
              username: user?.username ?? "",
              display_name: `${user?.firstName || ""} ${user?.lastName || ""}`,
              image_url: user?.imageUrl ?? "",
            },
          };

          addPost(newPost);
          if (onSubmitProp) onSubmitProp();
          form.reset();
          resetEditorState();
          return;
        }
        form.setError("content", { message: response?.error.message });
        return;
      },
    },
    user,
  );

  useEffect(() => {
    form.register("content");
  }, []);

  /**
   * Resets the editor state to an empty state
   */
  function resetEditorState() {
    if (editorRef.current) {
      editorRef.current.update(() => {
        const root = $getRoot();
        root.clear();
      });
    }
  }
  function handleContentChange(markdown: string) {
    form.setValue("content", markdown);
    form.trigger("content");
  }

  function onSubmit(data: z.infer<typeof postComposerSchema>) {
    console.log(data);
    mutate({ comment: data.content });
  }

  return (
    <form
      className="dark:bg-default-100 bg-default-100 dark:hover:bg-default-200 hover:bg-default-200 rounded-xl overflow-hidden min-h-24 group/post-composer"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <MarkdownProvider editorRef={editorRef} onChange={handleContentChange}>
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
                isDisabled={!form.formState.isValid || isPending}
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

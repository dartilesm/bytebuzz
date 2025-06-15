"use client";

import { MarkdownEditor } from "@/components/lexical-editor/markdown-editor";
import { MarkdownProvider } from "@/components/lexical-editor/markdown-provider";
import { MarkdownToolbar } from "@/components/lexical-editor/markdown-toolbar";
import { MarkdownToolbarDefaultActions } from "@/components/lexical-editor/markdown-toolbar-default-actions";
import type { MediaData } from "@/components/lexical-editor/plugins/media/media-node";
import { useCreatePostWithMediaMutation } from "@/hooks/mutation/use-create-post-with-media-mutation";
import { usePostsContext } from "@/hooks/use-posts-context";
import { useUploadPostMediaMutation } from "@/hooks/use-upload-post-media-mutation";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LexicalEditor } from "lexical";
import { $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
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
  const [mediaData, setMediaData] = useState<
    Array<{
      path: string;
      url: string;
      type: "image" | "video";
    }>
  >([]);

  const form = useForm<z.infer<typeof postComposerSchema>>({
    resolver: zodResolver(postComposerSchema),
    defaultValues: {
      content: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const { mutateAsync: uploadPostMedia } = useUploadPostMediaMutation();
  const { mutate: createPost, isPending } = useCreatePostWithMediaMutation();

  async function handleMediaUpload(file: File): Promise<{ error?: string; data?: MediaData }> {
    try {
      const { publicUrl, proxyUrl } = await uploadPostMedia(file);
      // Extract the path from the URL (last two segments)
      const path = publicUrl.split("/").slice(-3).join("/");

      // Store the media data for later use when creating the post
      setMediaData((prev) => [
        ...prev,
        {
          path,
          url: publicUrl,
          type: file.type.startsWith("image/") ? "image" : "video",
        },
      ]);

      return {
        data: {
          id: publicUrl,
          type: file.type.startsWith("image/") ? "image" : "video",
          src: proxyUrl,
          title: file.name,
          alt: file.name,
        },
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to upload media" };
    }
  }

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
    // Clear media data
    setMediaData([]);
  }

  function handleContentChange(markdown: string) {
    form.setValue("content", markdown);
    form.trigger("content");
  }

  async function onSubmit(data: z.infer<typeof postComposerSchema>) {
    try {
      // Create post with the first media (for now we only support one media per post)
      await createPost(
        {
          content: data.content,
          mediaData: mediaData[0],
        },
        {
          onSuccess: (newPost) => {
            addPost({
              ...newPost,
              user: {
                username: user?.username ?? "",
                display_name: `${user?.firstName || ""} ${user?.lastName || ""}`,
                image_url: user?.imageUrl ?? "",
              },
            });
          },
        },
      );

      if (onSubmitProp) onSubmitProp();
      form.reset();
      resetEditorState();
    } catch (error) {
      console.error("Error creating post:", error);
      form.setError("content", {
        message: error instanceof Error ? error.message : "Failed to create post",
      });
    }
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
              <MarkdownToolbarDefaultActions
                buttonClassName="bg-default-transparent duration-0 hover:bg-default-300 focus-visible:ring-2 focus-visible:ring-default-300 focus-visible:ring-primary"
                onMediaUpload={handleMediaUpload}
              />
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

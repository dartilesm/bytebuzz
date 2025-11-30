"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LexicalEditor } from "lexical";
import { $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MarkdownEditor } from "@/components/lexical-editor/markdown-editor";
import { MarkdownProvider } from "@/components/lexical-editor/markdown-provider";
import { MarkdownToolbar } from "@/components/lexical-editor/markdown-toolbar";
import { MarkdownToolbarDefaultActions } from "@/components/lexical-editor/markdown-toolbar-default-actions";
import type { MediaData } from "@/components/lexical-editor/plugins/media/media-node";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";
import { useCreatePostMutation } from "@/hooks/mutation/use-create-post-mutation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { usePostsContext } from "@/hooks/use-posts-context";
import { useUploadPostMediaMutation } from "@/hooks/use-upload-post-media-mutation";
import { log } from "@/lib/logger/logger";
import { cn } from "@/lib/utils";

const postComposerSchema = z.object({
  content: z.string().min(1),
});

type PostComposerProps = {
  placeholder?: string;
  replyPostId?: string;
  repostPostId?: string;
  onSubmit?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export function PostComposer({
  placeholder = "Start typing with markdown shortcuts...",
  replyPostId,
  repostPostId,
  onSubmit: onSubmitProp,
  children,
  className,
}: PostComposerProps) {
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
  const { mutate: createPost, isPending } = useCreatePostMutation();
  const { withAuth } = useAuthGuard();

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
      // Create post with all media files
      await createPost(
        {
          content: data.content,
          mediaData: mediaData,
          parent_post_id: replyPostId,
          repost_post_id: repostPostId,
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
      log.error("Error creating post", { error });
      form.setError("content", {
        message: error instanceof Error ? error.message : "Failed to create post",
      });
    }
  }

  return (
    <form
      className={cn(
        "dark:bg-muted bg-muted dark:hover:bg-muted/80 hover:bg-muted/80 rounded-xl overflow-hidden min-h-24 group/post-composer border border-border shadow-none",
        className,
      )}
      onSubmit={form.handleSubmit((data) => withAuth(() => onSubmit(data))())}
    >
      <MarkdownProvider editorRef={editorRef} onChange={handleContentChange}>
        <Section className="flex flex-row gap-2 md:gap-4">
          <div className="flex flex-row gap-2 z-10 shrink-0">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <MarkdownEditor
              placeholder={placeholder}
              contentClassName="min-h-12 p-0 text-sm md:text-base"
              autoFocus
            />
            <div className="py-2 md:py-4">{children}</div>
            <MarkdownToolbar className="bg-transparent border-none p-0 flex-wrap gap-1 md:gap-2">
              <MarkdownToolbarDefaultActions
                buttonClassName="bg-default-transparent duration-0 hover:bg-default-300 focus-visible:ring-2 focus-visible:ring-default-300 focus-visible:ring-primary text-xs md:text-sm"
                onMediaUpload={handleMediaUpload}
              />
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="ml-auto text-xs md:text-sm"
                disabled={!form.formState.isValid || isPending}
              >
                Post
              </Button>
            </MarkdownToolbar>
          </div>
        </Section>
      </MarkdownProvider>
    </form>
  );
}

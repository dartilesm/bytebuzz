"use client";

import { PlainTextCodeEditorDescriptor } from "@/components/rich-post-composer/custom-code-block-editor";
import { cn } from "@/lib/utils";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import {
  MDXEditor,
  codeBlockPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import type { RefObject } from "react";
import { CustomToolbar } from "./custom-toolbar";
import { mentionsPlugin, MentionPickerWrapper, type User } from "./plugins/mentions-plugin";

// Sample users for mentions
const sampleUsers: User[] = [
  {
    id: "1",
    displayName: "John Doe",
    username: "johndoe",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "2",
    displayName: "Jane Smith",
    username: "janesmith",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "3",
    displayName: "Bob Johnson",
    username: "bobjohnson",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
];

// Only import this to the next file
export function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: RefObject<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        codeBlockPlugin({
          codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor],
          defaultCodeBlockLanguage: "javascript",
        }),
        imagePlugin({
          imageUploadHandler: async (file: File) => {
            // Convert dropped/pasted images to base64
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          },
          disableImageSettingsButton: true,
          disableImageResize: true,
          EditImageToolbar: () => null,
        }),
        /* sandpackPlugin({ sandpackConfig: simpleSandpackConfig }), */
        /* codeMirrorPlugin({
            codeBlockLanguages: {
              css: "CSS",
              javascript: "JavaScript",
            },
            autoLoadLanguageSupport: true,
            codeMirrorExtensions: [],
          }), */
        // Example Plugin Usage
        listsPlugin(),
        linkPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        // Add mentions plugin
        mentionsPlugin({
          users: sampleUsers,
          trigger: "@",
          maxSuggestions: 5,
        }),
        toolbarPlugin({
          toolbarContents: () => <CustomToolbar />,
          toolbarPosition: "bottom",
        }),
      ]}
      {...props}
      ref={editorRef}
      contentEditableClassName={cn(
        "outline-none p-4 dark:bg-default-100 bg-default-100 dark:hover:bg-default-200 hover:bg-default-200 rounded-t-xl border-t border-default-200 border-x dark:border-0",
        {
          "focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background [&:focus-visible:not(:active)]:ring-2": false,
        },
        props.contentEditableClassName,
      )}
    />
  );
}

"use client";

import { PlainTextCodeEditorDescriptor } from "@/components/rich-editor/custom-code-block-editor";
import { cn } from "@/lib/utils";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import {
  MDXEditor,
  codeBlockPlugin,
  imagePlugin,
  listsPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { useRef, type CSSProperties, type RefObject, type ReactNode } from "react";
import { CustomToolbar } from "@/components/rich-editor/toolbar/custom-toolbar";
import { linksPlugin } from "@/components/rich-editor/plugins/links/links-plugin";
import { mentionsPlugin } from "@/components/rich-editor/plugins/mentions/mentions-plugin";

type RichEditorProps = MDXEditorProps & {
  editorRef: RefObject<MDXEditorMethods> | null;
  containerClassName?: string;
  /**
   * Children to completely override the toolbar content
   * @example
   * ```tsx
   * <RichEditor>
   *   <Button onClick={handleSave}>Save</Button>
   *   <Button onClick={handleCancel}>Cancel</Button>
   * </RichEditor>
   * ```
   */
  children?: ReactNode;
};

// Only import this to the next file
export function RichEditor({ editorRef, containerClassName, ...props }: RichEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleChange(markdown: string, initialMarkdownNormalize: boolean) {
    props.onChange?.(markdown, initialMarkdownNormalize);
    togglePlaceholder(markdown, initialMarkdownNormalize);
  }

  /**
   * Handles markdown content changes and manages placeholder visibility
   *
   * This function intercepts the onChange event from MDXEditor to:
   * 1. Show/hide the custom placeholder based on content state
   * 2. Forward the change event to the parent component
   *
   * @param markdown - The current markdown content from the editor
   * @param initialMarkdownNormalize - Flag indicating if this is the initial normalization
   */
  function togglePlaceholder(markdown: string, initialMarkdownNormalize: boolean) {
    // Early return if container ref is not available
    if (!containerRef.current) return;

    // Check if the editor content is empty
    const isEmpty = markdown === "";

    if (isEmpty) {
      // Show placeholder: Set the CSS variable with quoted string for CSS content property
      // The quotes are necessary because CSS content property requires string values to be quoted
      containerRef.current.style.setProperty(
        "--placeholder-text",
        `"${props.placeholder || "What's on your mind?"}"`,
      );
      // Forward the change event to parent component's onChange handler
      return props.onChange?.(markdown, initialMarkdownNormalize);
    }

    // Hide placeholder: Clear the CSS variable by setting it to empty quoted string
    // This ensures the ::before pseudo-element doesn't render any content
    containerRef.current.style.setProperty("--placeholder-text", `""`);

    // Forward the change event to parent component's onChange handler
    return props.onChange?.(markdown, initialMarkdownNormalize);
  }

  return (
    <div
      ref={containerRef}
      className={cn(containerClassName)}
      style={
        {
          "--placeholder-text": `"${props.placeholder || "What's on your mind?"}"`,
        } as CSSProperties
      }
    >
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
          // Custom links plugin with HeroUI Link component
          linksPlugin({
            autoLink: true,
          }),
          markdownShortcutPlugin(),
          // Add mentions plugin
          mentionsPlugin({
            trigger: "@",
            maxSuggestions: 5,
          }),
          toolbarPlugin({
            toolbarContents: () => <CustomToolbar>{props.children}</CustomToolbar>,
            toolbarPosition: "bottom",
            toolbarClassName: "absolute bottom-0 left-0 right-0",
          }),
        ]}
        {...props}
        onChange={handleChange}
        trim={false}
        ref={editorRef}
        className={cn("relative flex-1 h-full flex flex-col gap-4", props.className)}
        contentEditableClassName={cn(
          // When the editor is empty, it adds two divs, one for the placeholder and one for the content.
          // So below classes affect the placeholder and the content.
          "outline-none cursor-text pb-12",
          // Classes for the placeholder
          "[&:not([role='textbox'])]:hidden",
          // Add a fake placeholder
          "[&[role='textbox']]:before:[content:var(--placeholder-text)] [&[role='textbox']]:before:absolute [&[role='textbox']]:before:text-default-400",
          {
            "focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background [&:focus-visible:not(:active)]:ring-2": false,
          },
          props.contentEditableClassName,
        )}
      />
    </div>
  );
}

"use client";

import { PlainTextCodeEditorDescriptor } from "@/components/rich-post-composer/custom-code-block-editor";
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
import { useRef, type CSSProperties, type RefObject } from "react";
import { CustomToolbar } from "./custom-toolbar";
import { linksPlugin } from "./plugins/links-plugin";
import { mentionsPlugin } from "./plugins/mentions-plugin";

// Only import this to the next file
export function RichEditor({
  editorRef,
  ...props
}: { editorRef: RefObject<MDXEditorMethods> | null } & MDXEditorProps) {
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
            toolbarContents: () => <CustomToolbar />,
            toolbarPosition: "bottom",
          }),
        ]}
        {...props}
        onChange={handleChange}
        ref={editorRef}
        contentEditableClassName={cn(
          // When the editor is empty, it adds two divs, one for the placeholder and one for the content.
          // So below classes affect the placeholder and the content.
          "outline-none dark:bg-default-100 p-4 bg-default-100 dark:hover:bg-default-200 hover:bg-default-200 rounded-t-xl border-t border-default-200 border-x dark:border-0",
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

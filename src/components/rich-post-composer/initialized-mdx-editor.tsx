"use client";

import { CodeBlockEditor } from "@/components/ui/code-block-editor";
import { cn } from "@/lib/utils";
import type {
  CodeBlockEditorDescriptor,
  MDXEditorMethods,
  MDXEditorProps,
} from "@mdxeditor/editor";
import {
  MDXEditor,
  codeBlockPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  useCodeBlockEditorContext,
  insertCodeBlock$,
  usePublisher,
  linkPlugin,
} from "@mdxeditor/editor";
import type { RefObject } from "react";
import { Button } from "@heroui/button";
import { Code } from "lucide-react";

/**
 * Custom toolbar component with Insert Code Block button
 */
function CustomToolbar() {
  const insertCodeBlock = usePublisher(insertCodeBlock$);

  /**
   * Handle inserting a new code block
   */
  function handleInsertCodeBlock(): void {
    insertCodeBlock({
      code: "// Start typing your code here...",
      language: "javascript",
      meta: "",
    });
  }

  return (
    <div className="flex items-center gap-2 p-2 border dark:border-0 border-default-200 bg-default-50 rounded-b-xl">
      <Button
        size="sm"
        variant="flat"
        startContent={<Code size={16} />}
        onPress={handleInsertCodeBlock}
        aria-label="Insert code block"
        className="cursor-pointer"
      >
        Insert Code Block
      </Button>
    </div>
  );
}

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  // always use the editor, no matter the language or the meta of the code block
  match: (_language, _meta) => true,
  // You can have multiple editors with different priorities, so that there's a "catch-all" editor (with the lowest priority)
  priority: 0,
  // The Editor is a React component
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();

    /**
     * Handle removing the code block from the editor
     */
    function handleRemoveCodeBlock(): void {
      cb.parentEditor.update(() => {
        cb.lexicalNode.remove();
      });
    }

    // stops the propagation so that the parent lexical editor does not handle certain events.
    return (
      <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()} className="py-2">
        <CodeBlockEditor
          initialCode={props.code}
          onCodeChange={cb.setCode}
          initialLanguage={props.language}
          onRemoveCodeBlock={handleRemoveCodeBlock}
        />
      </div>
    );
  },
};

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

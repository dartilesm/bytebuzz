"use client";

import { CodeBlockEditor } from "@/components/ui/code-block-editor";
import type { CodeBlockEditorDescriptor } from "@mdxeditor/editor";
import { useCodeBlockEditorContext } from "@mdxeditor/editor";

export const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
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

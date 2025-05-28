"use client";

import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import type { RefObject } from "react";

const MDXEditor = dynamic(() => import("./rich-editor").then((mod) => mod.RichEditor));

const initialMarkdown = `

* Item 1
* Item 2
* **Item 3**
* nested item

\`\`\`css

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}

\`\`\`

  1. Item 1
  2. Item 2
`;

interface RichPostComposerProps extends Omit<MDXEditorProps, "ref" | "markdown"> {
  ref?: RefObject<MDXEditorMethods>;
  markdown?: string;
}

export function RichPostComposer({ markdown, ref }: RichPostComposerProps) {
  return (
    <MDXEditor
      markdown={markdown || initialMarkdown}
      contentEditableClassName="prose"
      editorRef={ref || null}
    />
  );
}

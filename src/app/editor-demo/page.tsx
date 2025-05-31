"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { MarkdownEditor } from "@/components/lexical-editor/lexical-editor";
import type { EditorState } from "lexical";

/**
 * Demo page for testing the Lexical markdown editor
 *
 * Features:
 * - Live preview of markdown content
 * - State management example
 * - Multiple editor instances
 */
export default function EditorDemoPage() {
  const [content, setContent] = useState("");
  const [secondContent, setSecondContent] = useState("");

  /**
   * Handles content changes from the first editor
   */
  function handleContentChange(markdown: string, editorState: EditorState) {
    setContent(markdown);
    console.log("Editor 1 - Markdown:", markdown);
    console.log("Editor 1 - EditorState:", editorState);
  }

  /**
   * Handles content changes from the second editor
   */
  function handleSecondContentChange(markdown: string, editorState: EditorState) {
    setSecondContent(markdown);
    console.log("Editor 2 - Markdown:", markdown);
    console.log("Editor 2 - EditorState:", editorState);
  }

  /**
   * Clears all editor content
   */
  function handleClearAll() {
    setContent("");
    setSecondContent("");
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lexical Markdown Editor Demo</h1>
        <p className="text-default-500">
          Test the new Lexical-based markdown editor with keyboard shortcuts. Try using markdown
          shortcuts like # for headers, ** for bold, * for italic, etc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Editor */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">Primary Editor</p>
              <p className="text-small text-default-500">
                Try markdown shortcuts: # ## ### ** * `` --- {">"} - 1.
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <MarkdownEditor
              placeholder="Start typing with markdown shortcuts..."
              onChange={handleContentChange}
              className="border border-default-200 rounded-lg"
              contentClassName="min-h-[200px]"
              autoFocus
            />
          </CardBody>
        </Card>

        {/* Content Preview */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">Content Preview</p>
              <p className="text-small text-default-500">Raw markdown output from the editor</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="bg-default-50 p-4 rounded-lg min-h-[200px] font-mono text-sm">
              <pre className="whitespace-pre-wrap">
                {content || "Type something in the editor..."}
              </pre>
            </div>
          </CardBody>
        </Card>

        {/* Second Editor */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">Secondary Editor</p>
              <p className="text-small text-default-500">Another editor instance for testing</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <MarkdownEditor
              placeholder="Another editor instance..."
              onChange={handleSecondContentChange}
              className="border border-default-200 rounded-lg"
              contentClassName="min-h-[150px]"
            />
          </CardBody>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">Controls</p>
              <p className="text-small text-default-500">Demo controls and information</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <Button color="danger" variant="flat" onPress={handleClearAll} className="w-full">
              Clear All Content
            </Button>

            <div className="space-y-2">
              <p className="text-sm font-medium">Supported Markdown Shortcuts:</p>
              <ul className="text-sm text-default-600 space-y-1">
                <li>
                  <code># </code> - Heading 1
                </li>
                <li>
                  <code>## </code> - Heading 2
                </li>
                <li>
                  <code>### </code> - Heading 3
                </li>
                <li>
                  <code>**text** </code> - Bold
                </li>
                <li>
                  <code>*text* </code> - Italic
                </li>
                <li>
                  <code>`code` </code> - Inline code
                </li>
                <li>
                  <code>--- </code> - Horizontal rule
                </li>
                <li>
                  <code>{">"} </code> - Blockquote
                </li>
                <li>
                  <code>- </code> - Bullet list
                </li>
                <li>
                  <code>1. </code> - Numbered list
                </li>
              </ul>
            </div>

            <div className="text-xs text-default-500">
              <p>Content Length: {content.length} characters</p>
              <p>Second Editor: {secondContent.length} characters</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

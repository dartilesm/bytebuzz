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
                Try markdown shortcuts, mentions, enhanced code blocks, and the toolbar: # ## ### **
                * `` --- {">"} - 1. @username ```js (press space after language)
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

              <p className="text-sm font-medium mt-4">Enhanced Code Blocks:</p>
              <ul className="text-sm text-default-600 space-y-1">
                <li>
                  <code>```javascript</code> + Space - Enhanced JavaScript code block
                </li>
                <li>
                  <code>```python</code> + Space - Enhanced Python code block
                </li>
                <li>
                  <code>```typescript</code> + Space - Enhanced TypeScript code block
                </li>
                <li>
                  <code>```html</code> + Space - Enhanced HTML code block
                </li>
                <li>
                  <code>```css</code> + Space - Enhanced CSS code block
                </li>
                <li>
                  Features: Monaco Editor, Copy/Download, Language Selection, Syntax Highlighting
                </li>
                <li>
                  <strong>Exit:</strong> Press <code>Enter</code> 3 times quickly to exit and
                  continue writing (auto-focuses editor)
                </li>
              </ul>

              <p className="text-sm font-medium mt-4">Toolbar Features:</p>
              <ul className="text-sm text-default-600 space-y-1">
                <li>
                  <strong>Insert Code Block</strong> - Click dropdown to select language and insert
                </li>
                <li>
                  <strong>Add Media</strong> - Upload images or videos (added at the end of content)
                </li>
                <li>
                  <strong>Quick Access</strong> - Popular languages: JavaScript, Python, HTML, CSS,
                  etc.
                </li>
                <li>
                  <strong>Alternative Method</strong> - Use toolbar instead of markdown shortcuts
                </li>
              </ul>

              <p className="text-sm font-medium mt-4">Media Features:</p>
              <ul className="text-sm text-default-600 space-y-1">
                <li>
                  <strong>Image Support</strong> - Upload JPEG, PNG, GIF, WebP images
                </li>
                <li>
                  <strong>Video Support</strong> - Upload MP4, WebM, AVI, MOV videos with controls
                </li>
                <li>
                  <strong>Always at End</strong> - Media is automatically placed at the bottom
                </li>
                <li>
                  <strong>Download & Delete</strong> - Each media item has action buttons
                </li>
                <li>
                  <strong>Responsive</strong> - Media scales properly on different screen sizes
                </li>
              </ul>

              <p className="text-sm font-medium mt-4">Auto Links:</p>
              <ul className="text-sm text-default-600 space-y-1">
                <li>
                  <strong>Smart URL Detection</strong> - Uses native URL validation (no regex!)
                </li>
                <li>
                  <strong>Valid URLs Only</strong> - Only converts actually valid URLs to links
                </li>
                <li>
                  <strong>Auto HTTPS</strong> - Adds https:// to www. domains automatically
                </li>
                <li>
                  <strong>Secure Protocols</strong> - Only accepts http:// and https:// URLs
                </li>
                <li>
                  <strong>Examples</strong> - Try: https://x.com/home, www.github.com, google.com
                </li>
              </ul>

              <p className="text-sm font-medium mt-4">Mentions:</p>
              <ul className="text-sm text-default-600 space-y-1">
                <li>
                  <code>@john </code> - Type @ to trigger user suggestions
                </li>
                <li>
                  <code>↑↓ </code> - Navigate suggestions with arrow keys
                </li>
                <li>
                  <code>Enter </code> - Select a user mention
                </li>
                <li>
                  <code>Esc </code> - Close suggestions
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

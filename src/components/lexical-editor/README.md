# Lexical Markdown Editor

A modern, extensible markdown editor built on Facebook's Lexical framework. This editor provides a clean, toolbar-free writing experience with real-time markdown shortcuts.

## Features

- ✅ **Markdown Shortcuts**: Type `#` for headings, `**` for bold, `*` for italic, etc.
- ✅ **No Toolbar**: Clean, distraction-free writing experience
- ✅ **Real-time Conversion**: Live markdown output as you type
- ✅ **Extensible**: Plugin-based architecture for custom features
- 🚧 **Mentions**: User mentions with `@` trigger (coming soon)
- 🚧 **Auto-complete**: Smart suggestions and completions (coming soon)

## Basic Usage

```tsx
import { MarkdownEditor } from "@/components/lexical-editor";
import { useState } from "react";

export function MyComponent() {
  const [content, setContent] = useState("");

  function handleChange(markdown: string, editorState: EditorState) {
    setContent(markdown);
    console.log("Markdown output:", markdown);
  }

  return <MarkdownEditor placeholder='Start writing...' onChange={handleChange} autoFocus />;
}
```

## Supported Markdown Shortcuts

| Shortcut     | Result          | Description     |
| ------------ | --------------- | --------------- |
| `# `         | `# Heading 1`   | Heading level 1 |
| `## `        | `## Heading 2`  | Heading level 2 |
| `### `       | `### Heading 3` | Heading level 3 |
| `**text**`   | **text**        | Bold text       |
| `*text*`     | _text_          | Italic text     |
| `` `code` `` | `code`          | Inline code     |
| `--- `       | `---`           | Horizontal rule |
| `> `         | `> Quote`       | Blockquote      |
| `- `         | `- Item`        | Bullet list     |
| `1. `        | `1. Item`       | Numbered list   |

## Props

| Prop               | Type                                                   | Default                  | Description                              |
| ------------------ | ------------------------------------------------------ | ------------------------ | ---------------------------------------- |
| `placeholder`      | `string`                                               | `"What's on your mind?"` | Placeholder text when editor is empty    |
| `onChange`         | `(markdown: string, editorState: EditorState) => void` | -                        | Called when content changes              |
| `className`        | `string`                                               | -                        | Additional CSS classes for container     |
| `contentClassName` | `string`                                               | -                        | Additional CSS classes for editable area |
| `editorRef`        | `RefObject<LexicalEditor>`                             | -                        | Ref to access editor instance            |
| `autoFocus`        | `boolean`                                              | `false`                  | Auto-focus editor on mount               |

## Advanced Usage

### With Ref Access

```tsx
import { MarkdownEditor } from "@/components/lexical-editor";
import { useRef } from "react";
import type { LexicalEditor } from "lexical";

export function AdvancedEditor() {
  const editorRef = useRef<LexicalEditor>(null);

  function insertText() {
    const editor = editorRef.current;
    if (editor) {
      editor.update(() => {
        // Programmatically insert content
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText("Hello world!");
        }
      });
    }
  }

  return (
    <div>
      <MarkdownEditor editorRef={editorRef} />
      <button onClick={insertText}>Insert Text</button>
    </div>
  );
}
```

### Custom Styling

```tsx
<MarkdownEditor
  className='border border-gray-300 rounded-lg shadow-sm'
  contentClassName='p-4 min-h-[300px] prose prose-sm max-w-none'
  placeholder='Write your story...'
/>
```

## Project Structure

```
src/components/lexical-editor/
├── lexical-editor.tsx           # Main editor component
├── plugins/
│   ├── mentions/               # Mention functionality (in progress)
│   │   ├── mention-node.tsx    # Lexical node for mentions
│   │   ├── mention-plugin.tsx  # Plugin logic
│   │   └── mention-suggestions.tsx # UI component
│   └── markdown-shortcuts/     # Additional shortcuts (future)
├── functions/
│   └── markdown-utils.ts       # Utility functions
├── index.ts                    # Main exports
└── README.md                   # This file
```

## Development

To test the editor, visit `/editor-demo` for a comprehensive demo page with multiple editor instances and live markdown preview.

## Coming Soon

- **Mentions**: Type `@username` to mention users
- **Enhanced Markdown**: Tables, footnotes, math expressions
- **Collaborative Editing**: Real-time collaboration support
- **Custom Themes**: Dark mode and custom color schemes
- **Import/Export**: Support for various formats (HTML, PDF, etc.)

## Contributing

When adding new features:

1. Follow the project guidelines (kebab-case filenames, JSDoc comments)
2. Place non-event functions in `/functions` folders for testability
3. Use HeroUI components for consistent styling
4. Write TypeScript interfaces for all props and data structures

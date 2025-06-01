"use client";

import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Code, ChevronDown } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $createEnhancedCodeBlockNode } from "../code-block/enhanced-code-block-node";

interface EditorToolbarProps {
  /**
   * Additional CSS classes for the toolbar
   */
  className?: string;
}

/**
 * Popular programming languages for quick access
 */
const POPULAR_LANGUAGES = [
  { key: "javascript", label: "JavaScript" },
  { key: "typescript", label: "TypeScript" },
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "html", label: "HTML" },
  { key: "css", label: "CSS" },
  { key: "json", label: "JSON" },
  { key: "markdown", label: "Markdown" },
  { key: "bash", label: "Bash" },
  { key: "sql", label: "SQL" },
];

/**
 * Editor toolbar component with code block insertion functionality
 *
 * Features:
 * - Code block insertion with language selection
 * - Popular languages dropdown
 * - Positioned at bottom of editor
 */
export function EditorToolbar({ className }: EditorToolbarProps) {
  const [editor] = useLexicalComposerContext();

  /**
   * Inserts a new enhanced code block with the specified language
   */
  function handleInsertCodeBlock(language: string): void {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Create enhanced code block
      const codeBlockNode = $createEnhancedCodeBlockNode(language);

      // Insert the code block
      selection.insertNodes([codeBlockNode]);

      // Add a paragraph after the code block for continued editing
      selection.insertParagraph();
    });
  }

  /**
   * Handles language selection from dropdown
   */
  function handleLanguageSelect(keys: Set<string>): void {
    const language = Array.from(keys)[0];
    if (language) {
      handleInsertCodeBlock(language);
    }
  }

  return (
    <div
      className={`flex items-center justify-start gap-2 p-2 border-t border-default-200 bg-default-50 ${className || ""}`}
    >
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="flat"
            size="sm"
            startContent={<Code size={16} />}
            endContent={<ChevronDown size={14} />}
            className="text-default-600 hover:text-default-900"
          >
            Insert Code Block
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Select programming language"
          onSelectionChange={(keys) => handleLanguageSelect(keys as Set<string>)}
          selectionMode="single"
        >
          {POPULAR_LANGUAGES.map((lang) => (
            <DropdownItem key={lang.key}>{lang.label}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      <div className="flex-1" />

      {/* Future toolbar items can be added here */}
      <div className="text-xs text-default-400">
        Tip: Type <code className="bg-default-200 px-1 rounded">```js</code> + Space for quick code
        blocks
      </div>
    </div>
  );
}

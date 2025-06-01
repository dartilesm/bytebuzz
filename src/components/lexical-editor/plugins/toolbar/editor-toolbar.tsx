"use client";

import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Code, ChevronDown, Upload } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $getRoot } from "lexical";
import { $createEnhancedCodeBlockNode } from "../code-block/enhanced-code-block-node";
import { $createMediaNode, type MediaData, type MediaType } from "../media/media-node";
import { useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
   * Inserts media at the end of the editor content
   */
  function handleInsertMedia(mediaData: MediaData): void {
    try {
      editor.update(() => {
        console.log("Creating media node with data:", mediaData);

        const root = $getRoot();

        // Create the media node
        const mediaNode = $createMediaNode(mediaData);
        console.log("Media node created:", mediaNode);

        // Always append media at the end
        root.append(mediaNode);

        console.log("Media node appended to root");
      });

      // Focus back to the editor after update
      editor.focus();
    } catch (error) {
      console.error("Error inserting media:", error);
      alert(`Error adding media: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Handles file upload for media insertion
   */
  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is image or video
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Please select an image or video file");
      return;
    }

    // Create object URL for preview
    const src = URL.createObjectURL(file);
    const mediaType: MediaType = isImage ? "image" : "video";

    const mediaData: MediaData = {
      id: `media-${Date.now()}`,
      type: mediaType,
      src,
      title: file.name,
      alt: isImage ? file.name : undefined,
    };

    handleInsertMedia(mediaData);

    // Clear the input
    event.target.value = "";
  }

  /**
   * Triggers file input click
   */
  function handleMediaButtonClick(): void {
    fileInputRef.current?.click();
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

      <Button
        variant="flat"
        size="sm"
        startContent={<Upload size={16} />}
        className="text-default-600 hover:text-default-900"
        onPress={handleMediaButtonClick}
      >
        Add Media
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload media file"
      />

      <div className="flex-1" />

      {/* Future toolbar items can be added here */}
      <div className="text-xs text-default-400">
        Tip: Type <code className="bg-default-200 px-1 rounded">```js</code> + Space for quick code
        blocks
      </div>
    </div>
  );
}

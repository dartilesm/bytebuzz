"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { cn, Tooltip } from "@heroui/react";
import { SiMarkdown } from "@icons-pack/react-simple-icons";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { Code, ImageUpIcon } from "lucide-react";
import { useRef } from "react";
import { $createEnhancedCodeBlockNode } from "./plugins/code-block/enhanced-code-block-node";
import { $createMediaNode, type MediaData, type MediaType } from "./plugins/media/media-node";
import { useMarkdownContext } from "@/components/lexical-editor/markdown-provider";

interface MarkdownToolbarProps {
  /**
   * Additional CSS classes for the toolbar
   */
  className?: string;
  /**
   * Additional CSS classes for the buttons
   */
  buttonClassName?: string;
}

/**
 * Editor toolbar component with code block insertion functionality
 *
 * Features:
 * - Code block insertion with language selection
 * - Popular languages dropdown
 * - Positioned at bottom of editor
 */
export function MarkdownToolbar({ className, buttonClassName }: MarkdownToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ensure we're within the provider context
  useMarkdownContext();

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

  return (
    <div
      className={cn(
        "flex items-center justify-start gap-2 p-2 border-t border-default-200 bg-default-50",
        className,
      )}
    >
      <Button
        variant="flat"
        size="sm"
        className={cn("text-default-600 hover:text-default-900 cursor-pointer", buttonClassName)}
        onPress={() => handleInsertCodeBlock("javascript")}
        isIconOnly
      >
        <Code size={16} />
      </Button>

      <Button
        variant="flat"
        size="sm"
        className={cn("text-default-600 hover:text-default-900 cursor-pointer", buttonClassName)}
        onPress={handleMediaButtonClick}
        isIconOnly
      >
        <ImageUpIcon size={16} />
      </Button>

      <Chip
        variant="bordered"
        size="sm"
        className="text-default-500 hover:text-default-500"
        classNames={{
          content: "inline-flex gap-2 items-center",
        }}
      >
        <Tooltip content="Certain markdown features are supported, click to learn more.">
          <span className="inline-flex gap-2 items-center">
            <SiMarkdown size={16} fill="currentColor" />
            <span className="leading-0">Markdown supported*</span>
          </span>
        </Tooltip>
      </Chip>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload media file"
      />
    </div>
  );
}

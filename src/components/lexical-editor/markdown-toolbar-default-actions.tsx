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
import { $createMediaNode, $isMediaNode, type MediaData } from "./plugins/media/media-node";
import { useUploadImageMutation } from "@/hooks/use-upload-image-mutation";

interface MarkdownToolbarDefaultActionsProps {
  /**
   * Additional CSS classes for the buttons
   */
  buttonClassName?: string;
  /**
   * Whether to show the markdown info chip
   */
  showMarkdownInfo?: boolean;
}

/**
 * Default actions for the markdown toolbar
 * Includes code block insertion, media upload, and markdown info
 */
export function MarkdownToolbarDefaultActions({
  buttonClassName,
  showMarkdownInfo = true,
}: MarkdownToolbarDefaultActionsProps) {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImageMutation();

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

    // Handle image upload with the mutation hook
    if (isImage) {
      // Create a unique ID for this media item
      const mediaId = `media-${Date.now()}`;

      // Immediately insert a loading media node
      const loadingMediaData: MediaData = {
        id: mediaId,
        type: "image",
        src: "", // Empty src during loading
        title: file.name,
        alt: file.name,
        isLoading: true,
      };

      handleInsertMedia(loadingMediaData);

      // Start the upload process
      uploadImageMutation.mutate(file, {
        onSuccess: (uploadedUrl) => {
          // Update the existing media node with the uploaded URL
          editor.update(() => {
            const root = $getRoot();
            const mediaNode = root.getChildren().find((child) => {
              if ($isMediaNode(child)) {
                const nodeData = child.getMediaData();
                return nodeData.id === mediaId;
              }
              return false;
            });

            if ($isMediaNode(mediaNode)) {
              mediaNode.setMediaData({
                ...loadingMediaData,
                src: uploadedUrl,
                isLoading: false,
              });
            }
          });
        },
        onError: (error) => {
          console.error("Upload failed:", error);
          alert("Failed to upload image. Please try again.");

          // Remove the loading node on error
          editor.update(() => {
            const root = $getRoot();
            const mediaNode = root.getChildren().find((child) => {
              if ($isMediaNode(child)) {
                const nodeData = child.getMediaData();
                return nodeData.id === mediaId;
              }
              return false;
            });

            if (mediaNode) {
              mediaNode.remove();
            }
          });
        },
      });
    } else {
      // For videos, use the blob URL as before (no upload needed)
      const src = URL.createObjectURL(file);
      const mediaData: MediaData = {
        id: `media-${Date.now()}`,
        type: "video",
        src,
        title: file.name,
      };

      handleInsertMedia(mediaData);
    }

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
    <>
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

      {showMarkdownInfo && (
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
      )}

      {/* Hidden file input for media upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload media file"
      />
    </>
  );
}

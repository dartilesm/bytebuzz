"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SiMarkdown } from "@icons-pack/react-simple-icons";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { Code, ImageUpIcon } from "lucide-react";
import { useRef } from "react";
import { $createEnhancedCodeBlockNode } from "./plugins/code-block/enhanced-code-block-node";
import { $createMediaNode, $isMediaNode, type MediaData } from "./plugins/media/media-node";
import { removeMediaNodeById, updateMediaNodeById } from "./functions/media-node-helpers";
import {
  validateMediaFile,
  createBlobMediaData,
  createLoadingMediaData,
} from "./functions/upload-handlers";
import { log } from "@/lib/logger/logger";

interface MarkdownToolbarDefaultActionsProps {
  /**
   * Additional CSS classes for the buttons
   */
  buttonClassName?: string;
  /**
   * Whether to show the markdown info chip
   */
  showMarkdownInfo?: boolean;
  /**
   * Custom media upload function that returns a Promise with { error, data } structure
   * If provided, this will be used for uploading media files
   */
  onMediaUpload?: (file: File) => Promise<{ error?: string; data?: MediaData }>;
}

/**
 * Default actions for the markdown toolbar
 * Includes code block insertion, media upload, and markdown info
 */
export function MarkdownToolbarDefaultActions({
  buttonClassName,
  showMarkdownInfo = true,
  onMediaUpload,
}: MarkdownToolbarDefaultActionsProps) {
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
   * If the last node is a MediaNode, adds the new item to it
   * Otherwise, creates a new MediaNode with the item
   */
  function handleInsertMedia(mediaData: MediaData): void {
    try {
      editor.update(() => {
        log.info("Creating media node with data", { mediaData });

        const root = $getRoot();
        const children = root.getChildren();
        const lastChild = children[children.length - 1];

        // Check if the last node is a MediaNode
        if ($isMediaNode(lastChild)) {
          // Add the new item to the existing MediaNode
          lastChild.addItem(mediaData);
          log.info("Media item added to existing MediaNode");
        } else {
          // Create a new MediaNode with the item
          const mediaNode = $createMediaNode(mediaData);
          log.info("Media node created", { mediaNode });

          // Always append media at the end
          root.append(mediaNode);

          log.info("Media node appended to root");
        }
      });

      // Focus back to the editor after update
      editor.focus();
    } catch (error) {
      log.error("Error inserting media", { error });
      alert(`Error adding media: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Handles file upload for media insertion
   */
  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.isValid) {
      alert("Please select an image or video file");
      return;
    }

    // Clear input immediately
    event.target.value = "";

    // Handle custom upload if provided
    if (onMediaUpload) return handleCustomMediaUpload(file);

    // Handle default blob URL media insertion
    const mediaData = createBlobMediaData(file);
    handleInsertMedia(mediaData);
  }

  /**
   * Handles custom media upload with loading state
   */
  async function handleCustomMediaUpload(file: File) {
    if (!onMediaUpload) return;

    const loadingMediaData = createLoadingMediaData(file);
    handleInsertMedia(loadingMediaData);

    const { error, data } = await onMediaUpload(file);

    if (error || !data) {
      handleUploadError(loadingMediaData.id, error || "Failed to upload media. Please try again.");
      return;
    }

    handleUploadSuccess(loadingMediaData.id, data);
  }

  /**
   * Handles upload success by updating the media node
   */
  function handleUploadSuccess(mediaId: string, data: MediaData): void {
    editor.update(() => {
      updateMediaNodeById(mediaId, {
        ...data,
        id: mediaId, // Keep the original ID
        isLoading: false,
      });
    });
  }

  /**
   * Handles upload error by removing the loading node
   */
  function handleUploadError(mediaId: string, errorMessage: string): void {
    log.error("Upload failed", { errorMessage });
    alert(`Failed to upload media: ${errorMessage}`);

    editor.update(() => {
      removeMediaNodeById(mediaId);
    });
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
        variant="ghost"
        size="icon"
        type="button"
        className={cn(
          "text-muted-foreground hover:text-foreground cursor-pointer h-8 w-8",
          buttonClassName,
        )}
        onClick={() => handleInsertCodeBlock("javascript")}
      >
        <Code size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        className={cn(
          "text-muted-foreground hover:text-foreground cursor-pointer h-8 w-8",
          buttonClassName,
        )}
        onClick={handleMediaButtonClick}
      >
        <ImageUpIcon size={16} />
      </Button>

      {showMarkdownInfo && (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="text-muted-foreground hover:text-muted-foreground inline-flex gap-2 items-center cursor-pointer font-normal"
              >
                <SiMarkdown size={16} fill="currentColor" />
                <span className="leading-0">Markdown supported*</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Certain markdown features are supported, click to learn more.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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

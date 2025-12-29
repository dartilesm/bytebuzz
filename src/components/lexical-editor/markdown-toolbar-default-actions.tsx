"use client";

import { SiMarkdown } from "@icons-pack/react-simple-icons";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { Code, ImageUpIcon, Smile } from "lucide-react";
import { useRef, useState } from "react";
import { EMOJI_PREFIX } from "@/components/lexical-editor/consts/emoji";
import {
  removeMediaNodeById,
  updateMediaNodeById,
} from "@/components/lexical-editor/functions/media-node-helpers";
import {
  createBlobMediaData,
  createLoadingMediaData,
  validateMediaFile,
} from "@/components/lexical-editor/functions/upload-handlers";
import { $createEnhancedCodeBlockNode } from "@/components/lexical-editor/plugins/code-block/enhanced-code-block-node";
import { $createInlineImageNode } from "@/components/lexical-editor/plugins/inline-image/inline-image-node";
import {
  $createMediaNode,
  $isMediaNode,
  type MediaData,
} from "@/components/lexical-editor/plugins/media/media-node";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmojiPicker as EmojiPicker2 } from "@/components/ui/emoji-picker-2/emoji-picker-2";
import type { EmojiData } from "@/components/ui/emoji-picker-2/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { CUSTOM_EMOJIS } from "@/lib/emojis/custom-emojis";
import { log } from "@/lib/logger/logger";
import { cn } from "@/lib/utils";

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
  const { withAuth } = useAuthGuard();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

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
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
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

    // Handle default blob URL media insertion with dimension extraction
    const mediaData = await createBlobMediaData(file);
    handleInsertMedia(mediaData);
  }

  /**
   * Handles custom media upload with loading state
   * Extracts dimensions before upload to preserve them
   */
  async function handleCustomMediaUpload(file: File) {
    if (!onMediaUpload) return;

    // Extract dimensions before upload to preserve them in loading state
    const loadingMediaData = await createLoadingMediaData(file);
    handleInsertMedia(loadingMediaData);

    const { error, data } = await onMediaUpload(file);

    if (error || !data) {
      handleUploadError(loadingMediaData.id, error || "Failed to upload media. Please try again.");
      return;
    }

    // Preserve dimensions from loading state if not provided by upload response
    const finalData: MediaData = {
      ...data,
      width: data.width ?? loadingMediaData.width,
      height: data.height ?? loadingMediaData.height,
    };

    handleUploadSuccess(loadingMediaData.id, finalData);
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

  /**
   * Handles emoji selection from the picker
   */
  function handleEmojiSelect(emoji: EmojiData): void {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (emoji.src) {
        // Insert custom emoji as InlineImageNode
        // This ensures it renders immediately as an image
        const fullId = emoji.creator ? `${emoji.creator}:${emoji.id}` : emoji.id;
        const src = emoji.creator ? `/api/emoji/${fullId}` : emoji.src;

        const node = $createInlineImageNode({
          src,
          alt: `${EMOJI_PREFIX}${emoji.name}`,
          id: fullId,
        });
        selection.insertNodes([node]);
        // Insert a space after to verify cursor position
        selection.insertText(" ");
      } else {
        selection.insertText(emoji.native || "");
      }
    });
    editor.focus();
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
        onClick={withAuth(handleMediaButtonClick)}
      >
        <ImageUpIcon size={16} />
      </Button>

      <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground cursor-pointer h-8 w-8",
              buttonClassName,
            )}
          >
            <Smile size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none w-auto" side="top" align="start">
          <EmojiPicker2 onEmojiSelect={handleEmojiSelect} custom={CUSTOM_EMOJIS}>
            <EmojiPicker2.Header>
              <EmojiPicker2.Search />
            </EmojiPicker2.Header>
            <EmojiPicker2.CategoryNavigation />
            <EmojiPicker2.Content />
            <EmojiPicker2.Footer />
          </EmojiPicker2>
        </PopoverContent>
      </Popover>

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
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload media file"
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { MediaData } from "@/components/lexical-editor/plugins/media/media-node";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MediaEditModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when the open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * The media data to edit
   */
  mediaData: MediaData | null;
  /**
   * Callback when save is clicked with updated data
   */
  onSave: (updatedData: Partial<MediaData>) => void;
}

/**
 * Modal component for editing media metadata
 * Displays a full-size preview and allows editing alt text
 */
export function MediaEditModal({ open, onOpenChange, mediaData, onSave }: MediaEditModalProps) {
  const [altText, setAltText] = useState("");

  /**
   * Update local state when mediaData changes
   */
  useEffect(() => {
    if (mediaData) {
      setAltText(mediaData.alt || "");
    }
  }, [mediaData]);

  /**
   * Handle save button click
   */
  function handleSave() {
    if (!mediaData) return;
    onSave({ alt: altText });
    onOpenChange(false);
  }

  /**
   * Handle cancel button click
   */
  function handleCancel() {
    // Reset to original value
    if (mediaData) {
      setAltText(mediaData.alt || "");
    }
    onOpenChange(false);
  }

  if (!mediaData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-12rem)] overflow-auto scrollbar-auto p-0">
        <DialogHeader className="pl-6 pr-3 py-4">
          <div>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>Update the metadata for this media file</DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-6 px-6">
          {/* Media Preview */}
          <div className="relative w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-96">
            {mediaData.type === "image" && (
              <img
                src={mediaData.src}
                alt={mediaData.alt || ""}
                className="w-full h-auto object-contain max-h-96"
              />
            )}
            {mediaData.type === "video" && (
              <video
                src={mediaData.src}
                controls
                className="w-full h-auto max-h-96"
                preload="metadata"
              >
                <track kind="captions" src="" label="Captions" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Alt Text Input */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt Text</Label>
            <DialogDescription className="text-xs">
              Alternative text describes images for people who cannot see them. It&apos;s also used
              by search engines.
            </DialogDescription>
            <Textarea
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Enter alt text..."
              className="w-full resize-none"
              variant="flat"
            />
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background px-6 py-4">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

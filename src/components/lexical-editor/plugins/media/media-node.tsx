"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";
import { DecoratorNode } from "lexical";
import { Download, Trash } from "lucide-react";
import type React from "react";

export type MediaType = "image" | "video";

export interface MediaData {
  id: string;
  type: MediaType;
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  isLoading?: boolean;
}

export interface SerializedMediaNode extends SerializedLexicalNode {
  mediaData: MediaData;
}

/**
 * Media Node that renders images and videos
 *
 * This provides a rich media experience:
 * - Image and video support
 * - Responsive display
 * - Delete functionality
 * - Download capability
 * - Always positioned at the end of content
 */
export class MediaNode extends DecoratorNode<React.ReactElement> {
  __mediaData: MediaData;

  static getType(): string {
    return "media";
  }

  static clone(node: MediaNode): MediaNode {
    return new MediaNode(node.__mediaData, node.__key);
  }

  static transform(): null {
    return null;
  }

  constructor(mediaData: MediaData, key?: NodeKey) {
    super(key);
    this.__mediaData = mediaData;
  }

  /**
   * Gets the media data
   */
  getMediaData(): MediaData {
    return this.__mediaData;
  }

  /**
   * Sets the media data
   */
  setMediaData(mediaData: MediaData): void {
    const writable = this.getWritable();
    writable.__mediaData = mediaData;
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-media", "true");
    element.setAttribute("data-media-type", this.__mediaData.type);
    element.setAttribute("data-media-id", this.__mediaData.id);
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: () => ({
        conversion: $convertMediaElement,
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode: SerializedMediaNode): MediaNode {
    const { mediaData } = serializedNode;
    return $createMediaNode(mediaData);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-media", "true");
    element.setAttribute("data-media-type", this.__mediaData.type);
    element.setAttribute("data-media-id", this.__mediaData.id);

    // Create appropriate media element for export
    if (this.__mediaData.type === "image") {
      const img = document.createElement("img");
      img.src = this.__mediaData.src;
      img.alt = this.__mediaData.alt || "";
      if (this.__mediaData.title) img.title = this.__mediaData.title;
      element.appendChild(img);
    } else if (this.__mediaData.type === "video") {
      const video = document.createElement("video");
      video.src = this.__mediaData.src;
      video.controls = true;
      if (this.__mediaData.title) video.title = this.__mediaData.title;
      element.appendChild(video);
    }

    return { element };
  }

  exportJSON(): SerializedMediaNode {
    return {
      mediaData: this.__mediaData,
      type: "media",
      version: 1,
    };
  }

  /**
   * Renders the media component
   */
  decorate(): React.ReactElement {
    return <MediaComponent node={this} mediaData={this.__mediaData} />;
  }

  isInline(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }
}

/**
 * Media component that renders the actual media content
 */
function MediaComponent({ node, mediaData }: { node: MediaNode; mediaData: MediaData }) {
  const [editor] = useLexicalComposerContext();

  /**
   * Handle media removal
   */
  function handleRemoveMedia(): void {
    editor.update(() => {
      node.remove();
    });
  }

  /**
   * Handle media download
   */
  function handleDownloadMedia(): void {
    const link = document.createElement("a");
    link.href = mediaData.src;
    link.download = mediaData.title || `media-${mediaData.id}`;
    link.click();
  }

  return (
    <Card className="w-full my-4">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Media Content */}
          <div className="relative">
            {mediaData.type === "image" ? (
              <img
                src={mediaData.src}
                alt={mediaData.alt || ""}
                title={mediaData.title}
                className="w-full h-auto rounded-lg shadow-sm max-h-96 object-contain bg-muted"
                loading="lazy"
              />
            ) : (
              <video
                src={mediaData.src}
                title={mediaData.title}
                controls
                className="w-full h-auto rounded-lg shadow-sm max-h-96"
                preload="metadata"
              >
                <track kind="captions" src="" label="Captions" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Media Info and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              {mediaData.title && (
                <span className="text-sm font-medium text-foreground">{mediaData.title}</span>
              )}
              <span className="text-xs text-muted-foreground capitalize">
                {mediaData.type} • {mediaData.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDownloadMedia}
                aria-label="Download media"
                className="cursor-pointer h-8 w-8"
                disabled={mediaData.isLoading}
              >
                <Download size={16} />
              </Button>

              <Button
                size="icon"
                variant="destructive"
                onClick={handleRemoveMedia}
                aria-label="Delete media"
                className="cursor-pointer h-8 w-8"
                disabled={mediaData.isLoading}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Creates a new MediaNode
 */
export function $createMediaNode(mediaData: MediaData): MediaNode {
  return new MediaNode(mediaData);
}

/**
 * Checks if a node is a MediaNode
 */
export function $isMediaNode(node: LexicalNode | null | undefined): node is MediaNode {
  return node instanceof MediaNode;
}

/**
 * Converts a DOM element to a MediaNode
 */
function $convertMediaElement(domNode: Node): DOMConversionOutput {
  const node = domNode as HTMLElement;

  if (node.getAttribute("data-lexical-media") === "true") {
    const mediaType = node.getAttribute("data-media-type") as MediaType;
    const mediaId = node.getAttribute("data-media-id") || "";

    // Try to extract media info from child elements
    let src = "";
    let alt = "";
    let title = "";

    if (mediaType === "image") {
      const img = node.querySelector("img");
      if (img) {
        src = img.src;
        alt = img.alt;
        title = img.title;
      }
    } else if (mediaType === "video") {
      const video = node.querySelector("video");
      if (video) {
        src = video.src;
        title = video.title;
      }
    }

    const mediaData: MediaData = {
      id: mediaId,
      type: mediaType,
      src,
      alt,
      title,
    };

    return {
      node: $createMediaNode(mediaData),
    };
  }

  return { node: null };
}

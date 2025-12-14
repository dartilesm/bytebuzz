"use client";

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
import { DownloadIcon, PencilIcon, TrashIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MediaEditModal } from "@/components/lexical-editor/plugins/media/media-edit-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

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
  items: MediaData[];
  version: number;
}

/**
 * Media Node that renders images and videos
 *
 * This provides a rich media experience:
 * - Image and video support
 * - Responsive display
 * - Delete functionality
 * - Download capability
 * - Carousel display for multiple items
 * - Always positioned at the end of content
 */
export class MediaNode extends DecoratorNode<React.ReactElement> {
  __items: MediaData[];

  static getType(): string {
    return "media";
  }

  static clone(node: MediaNode): MediaNode {
    return new MediaNode(node.__items, node.__key);
  }

  static transform(): null {
    return null;
  }

  constructor(items: MediaData | MediaData[], key?: NodeKey) {
    super(key);
    // Support both single item and array for backward compatibility
    this.__items = Array.isArray(items) ? items : [items];
  }

  /**
   * Gets all media items
   */
  getItems(): MediaData[] {
    return this.__items;
  }

  /**
   * Sets all media items
   */
  setItems(items: MediaData[]): void {
    const writable = this.getWritable();
    writable.__items = items;
  }

  /**
   * Adds a new media item to the node
   */
  addItem(item: MediaData): void {
    const writable = this.getWritable();
    writable.__items = [...writable.__items, item];
  }

  /**
   * Removes a media item by ID
   */
  removeItem(itemId: string): void {
    const writable = this.getWritable();
    writable.__items = writable.__items.filter((item) => item.id !== itemId);
  }

  /**
   * Updates a media item by ID
   */
  updateItem(itemId: string, updatedData: Partial<MediaData>): void {
    const writable = this.getWritable();
    writable.__items = writable.__items.map((item) =>
      item.id === itemId ? { ...item, ...updatedData } : item,
    );
  }

  /**
   * Gets a media item by ID
   */
  getItemById(itemId: string): MediaData | undefined {
    return this.__items.find((item) => item.id === itemId);
  }

  /**
   * Backward compatibility: gets the first media data
   */
  getMediaData(): MediaData {
    return this.__items[0];
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-media", "true");
    element.setAttribute("data-media-count", this.__items.length.toString());
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

  static importJSON(serializedNode: SerializedLexicalNode): MediaNode {
    const node = serializedNode as SerializedMediaNode & { mediaData?: MediaData };
    // Handle backward compatibility: if old format with single mediaData, convert to array
    if (
      "mediaData" in node &&
      node.mediaData &&
      typeof node.mediaData === "object" &&
      "id" in node.mediaData
    ) {
      return $createMediaNode([node.mediaData]);
    }
    // New format with items array
    if ("items" in node && Array.isArray(node.items)) {
      return $createMediaNode(node.items);
    }
    // Fallback: empty array
    return $createMediaNode([]);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-media", "true");
    element.setAttribute("data-media-count", this.__items.length.toString());

    // Create appropriate media elements for export
    for (const item of this.__items) {
      if (item.type === "image") {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.alt || "";
        if (item.title) img.title = item.title;
        element.appendChild(img);
      } else if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.src;
        video.controls = true;
        if (item.title) video.title = item.title;
        element.appendChild(video);
      }
    }

    return { element };
  }

  exportJSON(): SerializedMediaNode {
    return {
      items: this.__items,
      type: "media",
      version: 2,
    };
  }

  /**
   * Renders the media component
   */
  decorate(): React.ReactElement {
    return <MediaComponent node={this} items={this.__items} />;
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
function MediaComponent({ node, items }: { node: MediaNode; items: MediaData[] }) {
  const [editor] = useLexicalComposerContext();
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingMediaItem, setEditingMediaItem] = useState<MediaData | null>(null);
  const hasMoreThanOneItem = items.length > 1;

  /**
   * Sync current index with carousel API events
   */
  useEffect(() => {
    if (!api) return;
    if (items.length === 0) return;
    handleNewMediaItems();

    api.on("select", handleCarouselNavigate);
    api.on("reInit", handleNewMediaItems);

    return () => {
      api.off("select", handleCarouselNavigate);
      api.off("reInit", handleNewMediaItems);
    };
  }, [api, items.length]);

  function handleCarouselNavigate() {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }

  function handleNewMediaItems() {
    if (!api) return;
    api.scrollTo(items.length - 1);
  }

  function handleRemoveMedia(itemId: string) {
    editor.update(() => {
      const itemIndex = items.findIndex((item) => item.id === itemId);
      node.removeItem(itemId);
      if (node.getItems().length === 0) {
        node.remove();
        return;
      }

      // If we removed an item, adjust the carousel position
      if (api && hasMoreThanOneItem) {
        const newItems = node.getItems();
        // If we removed the last item, go to the previous one
        if (itemIndex >= newItems.length && newItems.length > 0) {
          api.scrollTo(newItems.length - 1);
        }
      }
    });
  }

  function handleDownloadMedia(item: MediaData) {
    const link = document.createElement("a");
    link.href = item?.src;
    link.download = item?.title || `media-${item?.id}`;
    link.click();
  }

  function handleEditMedia() {
    const currentItem = items[currentIndex] || items[0];
    if (currentItem) {
      setEditingMediaItem(currentItem);
    }
  }

  function handleSaveMedia(updatedData: Partial<MediaData>) {
    if (!editingMediaItem) return;

    editor.update(() => {
      node.updateItem(editingMediaItem.id, updatedData);
    });

    setEditingMediaItem(null);
  }

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex] || items[0];

  return (
    <CardContent className="p-0 border border-border rounded-lg overflow-hidden dark:bg-accent bg-accent/20">
      <div className="relative group">
        {/* Media Content */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-0 w-full h-auto max-h-96 flex items-center justify-center"
              >
                <>
                  {item.type === "image" && (
                    <img
                      src={item.src}
                      alt={item.alt || ""}
                      title={item.title}
                      className={cn("w-full object-contain object-center", {
                        "animate-pulse": item.isLoading,
                      })}
                      loading="lazy"
                    />
                  )}
                  {item.type === "video" && (
                    <video
                      src={item.src}
                      title={item.title}
                      controls
                      className={cn("w-full h-full rounded-lg shadow-sm max-h-96", {
                        "animate-pulse": item.isLoading,
                      })}
                      preload="metadata"
                    >
                      <track kind="captions" src="" label="Captions" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </>
              </CarouselItem>
            ))}
          </CarouselContent>
          {hasMoreThanOneItem && (
            <>
              <CarouselPrevious className="left-2 size-8" />
              <CarouselNext className="right-2 size-8" />
            </>
          )}
          {/* Carousel Indicators */}
          {hasMoreThanOneItem && <CarouselDots />}
        </Carousel>

        {/* Floating Action Buttons - Top Right Corner */}
        <div className="absolute top-2 px-2 flex items-center justify-between gap-1 z-20 w-full">
          <div>
            <Button
              size="icon-sm"
              variant="flat"
              onClick={handleEditMedia}
              aria-label="Edit media metadata"
              disabled={currentItem?.isLoading}
            >
              <PencilIcon className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="flat"
              onClick={() => handleDownloadMedia(currentItem)}
              aria-label="Download media"
              disabled={currentItem?.isLoading}
            >
              <DownloadIcon className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="flat"
              onClick={() => handleRemoveMedia(currentItem?.id)}
              aria-label="Delete media"
              disabled={currentItem?.isLoading}
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Compact Media Info - Bottom Left */}
        <Badge
          variant="flat"
          className="absolute bottom-2 left-2 z-10 flex items-center justify-center"
        >
          <span className="text-xs capitalize">
            {currentItem?.type}
            {hasMoreThanOneItem && ` • ${currentIndex + 1}/${items.length}`}
          </span>
        </Badge>
      </div>

      {/* Media Edit Modal */}
      <MediaEditModal
        open={editingMediaItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMediaItem(null);
          }
        }}
        mediaData={editingMediaItem}
        onSave={handleSaveMedia}
      />
    </CardContent>
  );
}

/**
 * Creates a new MediaNode
 * Accepts either a single MediaData or an array of MediaData items
 */
export function $createMediaNode(items: MediaData | MediaData[]): MediaNode {
  return new MediaNode(items);
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
    const items: MediaData[] = [];

    // Extract all media elements (images and videos)
    const images = node.querySelectorAll("img");
    const videos = node.querySelectorAll("video");

    for (const img of images) {
      items.push({
        id: img.src.split("/").pop() || `image-${items.length}`,
        type: "image",
        src: img.src,
        alt: img.alt,
        title: img.title,
      });
    }

    for (const video of videos) {
      items.push({
        id: video.src.split("/").pop() || `video-${items.length}`,
        type: "video",
        src: video.src,
        title: video.title,
      });
    }

    // If no items found, try legacy format
    if (items.length === 0) {
      const mediaType = node.getAttribute("data-media-type") as MediaType;
      const mediaId = node.getAttribute("data-media-id") || "";

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

      if (src) {
        items.push({
          id: mediaId || src.split("/").pop() || "media-0",
          type: mediaType,
          src,
          alt,
          title,
        });
      }
    }

    if (items.length > 0) {
      return {
        node: $createMediaNode(items),
      };
    }
  }

  return { node: null };
}

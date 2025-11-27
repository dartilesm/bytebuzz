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
import { ChevronLeft, ChevronRight, Download, Trash } from "lucide-react";
import type React from "react";
import { useState, useRef } from "react";

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
      item.id === itemId ? { ...item, ...updatedData } : item
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isCarousel = items.length > 1;

  /**
   * Scroll to a specific index in the carousel
   */
  function scrollToIndex(index: number) {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.offsetWidth;
    container.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  }

  /**
   * Handle scroll event to update current index
   */
  function handleScroll() {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(newIndex);
  }

  /**
   * Handle previous button click
   */
  function handlePrevious() {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    scrollToIndex(newIndex);
  }

  /**
   * Handle next button click
   */
  function handleNext() {
    const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  }

  /**
   * Handle media removal for a specific item
   */
  function handleRemoveMedia(itemId: string) {
    editor.update(() => {
      node.removeItem(itemId);
      // If no items left, remove the node
      if (node.getItems().length === 0) {
        node.remove();
      } else {
        // Adjust current index if needed
        const newItems = node.getItems();
        if (currentIndex >= newItems.length) {
          setCurrentIndex(newItems.length - 1);
        }
      }
    });
  }

  /**
   * Handle media download for a specific item
   */
  function handleDownloadMedia(item: MediaData) {
    const link = document.createElement("a");
    link.href = item.src;
    link.download = item.title || `media-${item.id}`;
    link.click();
  }

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <Card className='w-full'>
      <CardContent>
        <div className='flex flex-col gap-3'>
          {/* Media Content */}
          <div className='relative'>
            {isCarousel && (
              <div className='relative'>
                {/* Carousel Container */}
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className='flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth'
                >
                  {items.map((item) => (
                    <div key={item.id} className='w-full snap-start shrink-0'>
                      {item.type === "image" && (
                        <img
                          src={item.src}
                          alt={item.alt || ""}
                          title={item.title}
                          className='w-full h-full rounded-lg shadow-sm max-h-96 bg-muted object-cover'
                          loading='lazy'
                        />
                      )}
                      {item.type === "video" && (
                        <video
                          src={item.src}
                          title={item.title}
                          controls
                          className='w-full h-auto rounded-lg shadow-sm max-h-96'
                          preload='metadata'
                        >
                          <track kind='captions' src='' label='Captions' />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                {items.length > 1 && (
                  <>
                    <Button
                      size='icon'
                      variant='secondary'
                      onClick={handlePrevious}
                      aria-label='Previous media'
                      className='absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow-lg bg-background/80 hover:bg-background'
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      size='icon'
                      variant='secondary'
                      onClick={handleNext}
                      aria-label='Next media'
                      className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow-lg bg-background/80 hover:bg-background'
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </>
                )}

                {/* Carousel Indicators */}
                {items.length > 1 && (
                  <div className='flex justify-center gap-2 mt-2'>
                    {items.map((_, index) => (
                      <Button
                        key={index}
                        size='icon'
                        variant='secondary'
                        onClick={() => scrollToIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? "w-8 bg-primary"
                            : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {!isCarousel && (
              <div className='relative'>
                {currentItem.type === "image" && (
                  <img
                    src={currentItem.src}
                    alt={currentItem.alt || ""}
                    title={currentItem.title}
                    className='w-full h-auto rounded-lg shadow-sm max-h-96 bg-muted object-cover'
                    loading='lazy'
                  />
                )}
                {currentItem.type === "video" && (
                  <video
                    src={currentItem.src}
                    title={currentItem.title}
                    controls
                    className='w-full h-auto rounded-lg shadow-sm max-h-96'
                    preload='metadata'
                  >
                    <track kind='captions' src='' label='Captions' />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
          </div>

          {/* Media Info and Actions */}
          <div className='flex items-center justify-between'>
            <div className='flex flex-col gap-1'>
              {currentItem.title && (
                <span className='text-sm font-medium text-foreground'>{currentItem.title}</span>
              )}
              <span className='text-xs text-muted-foreground capitalize'>
                {currentItem.type} • {currentItem.id}
                {isCarousel && ` • ${currentIndex + 1} of ${items.length}`}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                size='icon'
                variant='ghost'
                onClick={() => handleDownloadMedia(currentItem)}
                aria-label='Download media'
                className='cursor-pointer h-8 w-8'
                disabled={currentItem.isLoading}
              >
                <Download size={16} />
              </Button>

              <Button
                size='icon'
                variant='destructive'
                onClick={() => handleRemoveMedia(currentItem.id)}
                aria-label='Delete media'
                className='cursor-pointer h-8 w-8'
                disabled={currentItem.isLoading}
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

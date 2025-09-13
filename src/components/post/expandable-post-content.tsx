"use client";

import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import { Button, ScrollShadow, cn } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";
import { useRef, useState } from "react";
import {
  getEstimatedHeightForBlocks,
  getInitialBlockCount,
  shouldContentBeExpandable,
  splitContentIntoBlocks,
} from "@/components/post/functions/expandable-content-utils";

const CONTENT_BLOCK_HEIGHT_PX = 500;

interface ExpandablePostContentProps {
  content: string;
  postId: string;
  className?: string;
}

/**
 * Component that renders post content with expandable blocks functionality
 * Shows content progressively with "View more" button to expand next block
 */
export function ExpandablePostContent({ content, postId, className }: ExpandablePostContentProps) {
  const blocks = splitContentIntoBlocks(content, CONTENT_BLOCK_HEIGHT_PX);
  const isExpandable = shouldContentBeExpandable(content, CONTENT_BLOCK_HEIGHT_PX);
  const initialBlockCount = getInitialBlockCount(blocks, CONTENT_BLOCK_HEIGHT_PX);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [visibleBlockCount, setVisibleBlockCount] = useState(
    isExpandable ? initialBlockCount : blocks.length,
  );
  const [contentCurrentHeight, setContentCurrentHeight] = useState(CONTENT_BLOCK_HEIGHT_PX);

  const hasMoreBlocks = visibleBlockCount < blocks.length;

  /**
   * Handles expanding to show the next block
   */
  function handleViewMore() {
    if (containerRef.current && contentRef.current) {
      // Get current height before expanding
      const currentHeight = contentRef.current.scrollHeight;
      containerRef.current.style.height = `${currentHeight}px`;

      // Update visible block count
      const nextCount = Math.min(visibleBlockCount + 1, blocks.length);
      setVisibleBlockCount(nextCount);

      // Update content current height
      const heightInterval =
        (contentRef.current?.clientHeight - CONTENT_BLOCK_HEIGHT_PX) / blocks.length;

      setContentCurrentHeight(CONTENT_BLOCK_HEIGHT_PX + heightInterval * nextCount);

      // Use requestAnimationFrame to get new height after DOM updates
      requestAnimationFrame(() => {
        if (containerRef.current && contentRef.current) {
          let newHeight = contentRef.current.scrollHeight;

          // Fallback to estimated height if actual height seems too small
          const estimatedHeight = getEstimatedHeightForBlocks(
            blocks,
            nextCount,
            CONTENT_BLOCK_HEIGHT_PX,
          );
          if (newHeight < estimatedHeight * 0.8) {
            newHeight = estimatedHeight;
          }

          containerRef.current.style.height = `${newHeight}px`;
        }
      });
    }
  }

  console.log({
    contentCurrentHeight,
    visibleBlockCount,
    blocks,
  });

  if (!isExpandable) {
    return (
      <ScrollShadow className={cn("max-h-none overflow-visible", className)} hideScrollBar size={0}>
        <MarkdownViewer markdown={content} postId={postId} />
      </ScrollShadow>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="transition-all duration-500 ease-out overflow-hidden"
        style={{ height: "auto", maxHeight: `${contentCurrentHeight}px` }}
      >
        <ScrollShadow
          size={100}
          style={{ overflow: "hidden" }}
          hideScrollBar
          className={cn("transition-all duration-300", className)}
          visibility={hasMoreBlocks ? "bottom" : undefined}
          ref={contentRef}
        >
          <MarkdownViewer markdown={content} postId={postId} />
        </ScrollShadow>
      </div>

      {hasMoreBlocks && (
        <Button
          variant="light"
          size="sm"
          onPress={handleViewMore}
          className="self-start text-primary hover:text-primary-600 transition-colors"
          startContent={<ChevronDownIcon size={16} />}
        >
          View more
        </Button>
      )}
    </>
  );
}

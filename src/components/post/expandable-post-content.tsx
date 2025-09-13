"use client";

import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import {
  getDisplayContent,
  getExpansionData,
} from "@/components/post/functions/expandable-content-utils";
import { Button, ScrollShadow, cn } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExpandableMarkdownConfig {
  /** Minimum content length before expansion controls appear */
  minVisibleContentLength?: number;

  /** Chars per level */
  charsPerLevel?: number;
}

interface ExpandablePostContentProps extends ExpandableMarkdownConfig {
  content: string;
  postId: string;
  className?: string;
}

/**
 * Component that renders post content with expandable blocks functionality
 * Shows content progressively with "View more" button to expand next block
 */
export function ExpandablePostContent({
  content,
  postId,
  className,
  ...config
}: ExpandablePostContentProps) {
  const { minVisibleContentLength = 1000, charsPerLevel = 300 } = config;

  const [expansionLevel, setExpansionLevel] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  const expansionData = getExpansionData({ content, minVisibleContentLength, charsPerLevel });

  const displayContent = getDisplayContent({ content, expansionLevel, expansionData });

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [displayContent]);

  const canExpand = expansionLevel < expansionData.levels - 1;
  const isFullyExpanded = expansionLevel >= expansionData.levels - 1;

  function handleExpand() {
    if (canExpand) {
      setExpansionLevel((prev) => prev + 1);
    }
  }

  if (!canExpand) {
    return (
      <ScrollShadow className={cn("max-h-none overflow-visible", className)} hideScrollBar size={0}>
        <MarkdownViewer markdown={content} postId={postId} />
      </ScrollShadow>
    );
  }

  return (
    <>
      <div
        className="transition-all duration-500 ease-out overflow-hidden"
        style={{ height: contentHeight ? `${contentHeight}px` : "auto" }}
      >
        <ScrollShadow
          size={100}
          style={{ overflow: "hidden" }}
          hideScrollBar
          className={cn("transition-all duration-300", className)}
          visibility={!isFullyExpanded ? "bottom" : undefined}
          ref={contentRef}
        >
          <MarkdownViewer markdown={displayContent} postId={postId} />
        </ScrollShadow>
      </div>

      {canExpand && (
        <Button
          variant="light"
          size="sm"
          onPress={handleExpand}
          className="self-start text-primary hover:text-primary-600 transition-colors"
          startContent={<ChevronDownIcon size={16} />}
        >
          View more
        </Button>
      )}
    </>
  );
}

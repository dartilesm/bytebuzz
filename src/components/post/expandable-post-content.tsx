"use client";

import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import {
  getDisplayContent,
  getExpansionData,
} from "@/components/post/functions/expandable-content-utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
      <div className={cn("max-h-none overflow-visible", className)}>
        <MarkdownViewer markdown={content} postId={postId} />
      </div>
    );
  }

  return (
    <>
      <div
        className='transition-all duration-500 ease-out overflow-hidden'
        style={{ height: contentHeight ? `${contentHeight}px` : "auto" }}
      >
        <ScrollArea
          className={cn("transition-all duration-300", className)}
          ref={contentRef}
        >
          <MarkdownViewer markdown={displayContent} postId={postId} />
        </ScrollArea>
      </div>

      {canExpand && (
        <Button
          variant='ghost'
          size='sm'
          onClick={handleExpand}
          className='self-start text-primary hover:text-primary-600 transition-colors'
        >
          <ChevronDownIcon size={16} className="mr-2" />
          View moree
        </Button>
      )}
    </>
  );
}

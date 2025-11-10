"use client";

import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import {
  getDisplayContent,
  getExpansionData,
} from "@/components/post/functions/expandable-content-utils";
import { usePostContext } from "@/hooks/use-post-context";
import { Button, CardBody, ScrollShadow, cn } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PostContentProps {
  children?: React.ReactNode;
}

export function PostContent({ children }: PostContentProps) {
  const {
    isThreadPagePost,
    post,
    minVisibleContentLength = 1000,
    charsPerLevel = 300,
  } = usePostContext();
  const { content } = post;

  const [expansionLevel, setExpansionLevel] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<string | undefined>(undefined);

  const expansionData = getExpansionData({
    content: content ?? "",
    minVisibleContentLength,
    charsPerLevel,
  });

  const displayContent = getDisplayContent({
    content: content ?? "",
    expansionLevel,
    expansionData,
  });

  const canExpand = expansionLevel < expansionData.levels - 1;
  const isFullyExpanded = expansionLevel >= expansionData.levels - 1;

  useEffect(() => {
    if (contentRef.current) {
      const contentRefHeight = `${contentRef.current.scrollHeight}px`;
      const height = expansionLevel !== expansionData.levels - 1 ? contentRefHeight : "auto";
      setContentHeight(height);
    }
  }, [expansionLevel]);

  function handleExpand() {
    setExpansionLevel((prev) => prev + 1);
  }
  return (
    <CardBody
      className={cn("flex-1 py-0 text-sm px-2 md:px-4", {
        "md:px-8.5": isThreadPagePost,
        "flex flex-col gap-2": !expansionData.shouldShowControls,
      })}
    >
      {!expansionData.shouldShowControls && (
        <MarkdownViewer markdown={content ?? ""} postId={post.id ?? ""} />
      )}
      {expansionData.shouldShowControls && (
        <>
          <div
            className='transition-all duration-300 ease-out overflow-hidden'
            style={{ height: contentHeight || "auto" }}
          >
            <ScrollShadow
              size={50}
              style={{ overflow: "hidden" }}
              hideScrollBar
              className='transition-all duration-300 flex flex-col gap-2'
              visibility={!isFullyExpanded ? "bottom" : undefined}
              ref={contentRef}
            >
              <MarkdownViewer markdown={displayContent} postId={post.id ?? ""} />
            </ScrollShadow>
          </div>
          {canExpand && (
            <Button
              variant='light'
              size='sm'
              onPress={handleExpand}
              className='self-start text-primary hover:text-primary-600 transition-colors'
              startContent={<ChevronDownIcon size={16} />}
            >
              View more
            </Button>
          )}
        </>
      )}

      {children}
    </CardBody>
  );
}

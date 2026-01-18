"use client";

import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type DisallowedElements,
  MarkdownViewer,
} from "@/components/markdown-viewer/markdown-viewer";
import {
  getDisplayContent,
  getExpansionData,
} from "@/components/post/functions/expandable-content-utils";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PostClickEvent } from "@/context/post-provider";
import { useContentViewerContext } from "@/hooks/use-content-viewer-context";
import { usePostContext } from "@/hooks/use-post-context";
import { cn } from "@/lib/utils";

const HIDDEN_MEDIA_ELEMENTS: DisallowedElements = ["img", "code"] as const;

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
  const { isOpen: isContentViewerOpen, postId: viewerPostId, closeViewer } = useContentViewerContext();
  const { content } = post;

  const [expansionLevel, setExpansionLevel] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<string | undefined>(undefined);

  const { onPostClick } = usePostContext();

  function handleEvent(event: PostClickEvent) {
    if ((event.source === "img" || event.source === "code") && event.type === "click") {
      // Attach data attributes to event to prevent double click
      (event.target as HTMLElement).setAttribute("data-non-propagatable", "true");
      // Dispatch click event to PostProvider with content items
      return onPostClick(event);
    }
    // For other events, close viewer if open
    if (isContentViewerOpen) {
      closeViewer();
    }
  }

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

  const shouldHideMedia = isContentViewerOpen && (isThreadPagePost || post.id === viewerPostId);
  const disallowedMediaElements = shouldHideMedia ? HIDDEN_MEDIA_ELEMENTS : [];

  useEffect(() => {
    if (contentRef.current) {
      const contentRefHeight = `${contentRef.current.scrollHeight}px`;
      const height = expansionLevel !== expansionData.levels - 1 ? contentRefHeight : "auto";
      setContentHeight(height);
    }
  }, [expansionLevel, expansionData.levels]);

  function handleExpand() {
    setExpansionLevel((prev) => prev + 1);
  }

  return (
    <CardContent
      className={cn("flex-1 py-0 text-sm px-2 md:px-4", {
        "md:px-8.5": isThreadPagePost,
        "flex flex-col gap-2": !expansionData.shouldShowControls,
      })}
    >
      {!expansionData.shouldShowControls && (
        <MarkdownViewer
          markdown={content ?? ""}
          postId={post.id ?? ""}
          disallowedElements={disallowedMediaElements}
          onEvent={handleEvent}
        />
      )}
      {expansionData.shouldShowControls && (
        <>
          <div
            className="transition-all duration-300 ease-out overflow-hidden"
            style={{ height: contentHeight || "auto" }}
          >
            <ScrollArea
              className="h-full transition-all duration-300 bg-card [&>div>div]:flex! [&>div>div]:flex-col [&>div>div]:gap-4"
              shadowVisibility={isFullyExpanded ? "none" : "bottom"}
              ref={contentRef}
            >
              <MarkdownViewer
                markdown={displayContent}
                postId={post.id ?? ""}
                disallowedElements={disallowedMediaElements}
                onEvent={handleEvent}
              />
            </ScrollArea>
          </div>
          {canExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpand}
              className="self-start text-primary hover:text-primary-600 transition-colors"
            >
              <ChevronDownIcon size={16} className="mr-2" />
              View more
            </Button>
          )}
        </>
      )}

      {children}
    </CardContent>
  );
}

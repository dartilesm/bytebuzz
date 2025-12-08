"use client";

import { createContext, useState } from "react";
import { ContentViewerModal } from "@/components/content-viewer/content-viewer-modal";

export type ContentType = "image" | "code";

export interface ContentItem {
  type: ContentType;
  id: string; // unique identifier (url for images, or generated ID for code)
  data: {
    // Image specific
    src?: string;
    alt?: string;
    // Code specific
    language?: string;
    code?: string;
    filename?: string;
  };
}

export interface ContentViewerContextType {
  isOpen: boolean;
  postId: string | undefined;
  contentItems: ContentItem[];
  initialContentIndex: number;
  openViewer: (items: ContentItem[], postId: string, initialIndex?: number) => void;
  closeViewer: () => void;
}

export const ContentViewerContext = createContext<ContentViewerContextType>({
  isOpen: false,
  postId: undefined,
  contentItems: [],
  initialContentIndex: 0,
  openViewer: () => {},
  closeViewer: () => {},
});

/**
 * Provider component that manages the content viewer modal state
 */
export function ContentViewerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [initialContentIndex, setInitialContentIndex] = useState(0);
  const [postId, setPostId] = useState<string | undefined>(undefined);

  function openViewer(newItems: ContentItem[], newPostId: string, initialIndex = 0) {
    setContentItems(newItems);
    setInitialContentIndex(initialIndex);
    setPostId(newPostId);
    setIsOpen(true);
  }

  function closeViewer() {
    setIsOpen(false);
    setContentItems([]);
    setInitialContentIndex(0);
    setPostId(undefined);
  }

  return (
    <ContentViewerContext.Provider
      value={{
        isOpen,
        contentItems,
        initialContentIndex,
        postId,
        openViewer,
        closeViewer,
      }}
    >
      {children}
      {isOpen && <ContentViewerModal key={postId} />}
    </ContentViewerContext.Provider>
  );
}

"use client";

import { createContext, useState } from "react";
import { ContentViewerModal } from "@/components/content-viewer/content-viewer-modal";

export interface ContentViewerContextType {
  isOpen: boolean;
  content: React.ReactNode | null;
  postId: string | undefined;
  openViewer: (content: React.ReactNode, postId: string) => void;
  closeViewer: () => void;
}

export const ContentViewerContext = createContext<ContentViewerContextType>({
  isOpen: false,
  content: null,
  postId: undefined,
  openViewer: () => {},
  closeViewer: () => {},
});

/**
 * Provider component that manages the content viewer modal state
 */
export function ContentViewerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const [postId, setPostId] = useState<string | undefined>(undefined);

  function openViewer(newContent: React.ReactNode, newPostId: string) {
    setContent(newContent);
    setPostId(newPostId);
    setIsOpen(true);
  }

  function closeViewer() {
    setIsOpen(false);
    setContent(null);
    setPostId(undefined);
  }

  return (
    <ContentViewerContext.Provider
      value={{
        isOpen,
        content,
        postId,
        openViewer,
        closeViewer,
      }}
    >
      {children}
      {isOpen && <ContentViewerModal />}
    </ContentViewerContext.Provider>
  );
}


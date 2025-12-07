"use client";

import { createContext, useState } from "react";
import { ContentViewerModal } from "@/components/content-viewer/content-viewer-modal";

export interface ImageData {
  src: string;
  alt?: string;
}

export interface ContentViewerContextType {
  isOpen: boolean;
  postId: string;
  images: ImageData[];
  initialImageIndex: number;
  openViewer: (images: ImageData[], postId: string, initialIndex?: number) => void;
  closeViewer: () => void;
}

export const ContentViewerContext = createContext<ContentViewerContextType>({
  isOpen: false,
  postId: "",
  images: [],
  initialImageIndex: 0,
  openViewer: () => {},
  closeViewer: () => {},
});

/**
 * Provider component that manages the content viewer modal state
 */
export function ContentViewerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [postId, setPostId] = useState<string>("");

  function openViewer(newImages: ImageData[], newPostId: string, initialIndex = 0) {
    setImages(newImages);
    setInitialImageIndex(initialIndex);
    setPostId(newPostId);
    setIsOpen(true);
  }

  function closeViewer() {
    setIsOpen(false);
    setImages([]);
    setInitialImageIndex(0);
    setPostId("");
  }

  return (
    <ContentViewerContext.Provider
      value={{
        isOpen,
        images,
        initialImageIndex,
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

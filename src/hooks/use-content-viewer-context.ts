"use client";

import { useContext } from "react";
import { ContentViewerContext } from "@/context/content-viewer-context";

/**
 * Hook to access the content viewer context
 */
export function useContentViewerContext() {
  const context = useContext(ContentViewerContext);
  if (!context) {
    throw new Error("useContentViewerContext must be used within ContentViewerProvider");
  }
  return context;
}


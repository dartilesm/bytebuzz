"use client";

import { getAllContentFromMarkdown } from "@/components/markdown-viewer/functions/get-all-content-from-markdown";
import { PostActionModal } from "@/components/post/post-action-modal";
import { useContentViewerContext } from "@/hooks/use-content-viewer-context";
import type { MarkdownComponentEvent } from "@/types/markdown-component-events";
import type { NestedPost } from "@/types/nested-posts";
import { useParams, usePathname, useRouter } from "next/navigation";
import { createContext, type MouseEvent, useState } from "react";

const navigationDisabledElementSelectors = [
  "a",
  "button",
  "pre",
  "#post-card-footer",
  "#post-card-header",
];

export type PostClickEvent = MouseEvent<HTMLElement> & Partial<MarkdownComponentEvent>;

export interface PostContextType {
  post: NestedPost;
  isThread?: boolean;
  isFirstInThread?: boolean;
  isLastInThread?: boolean;
  /**
   * When true, disables click-to-navigate interaction on the post.
   * Used when the post is displayed in a modal context where navigation should be prevented.
   */
  isNavigationDisabled?: boolean;

  /**
   * Indicates if this post is the main post being viewed in a thread page.
   * This is used to determine if the post should be rendered differently
   * as it's the focus of the current page.
   */
  isThreadPagePost?: boolean;
  minVisibleContentLength?: number;
  charsPerLevel?: number;
  togglePostModal: (isOpen?: boolean, action?: "reply" | "clone") => void;
  /**
   * Handler for post click events. Can be called by any nested component to trigger
   * navigation, viewer opening, or other post-related actions.
   */
  onPostClick: (event?: PostClickEvent) => void;
}

export const PostContext = createContext<PostContextType>({} as PostContextType);

export interface PostProviderProps {
  children: React.ReactNode;
  post: NestedPost;
  isNavigationDisabled?: boolean;
  isThread?: boolean;
  isFirstInThread?: boolean;
  isLastInThread?: boolean;
  /**
   * Minimum content length before expansion controls appear
   */
  minVisibleContentLength?: number;
  /**
   * Initial characters per each expansion level
   */
  charsPerLevel?: number;
}

export function PostProvider({
  children,
  isNavigationDisabled = false,
  post,
  isThread,
  isFirstInThread,
  isLastInThread,
  minVisibleContentLength,
  charsPerLevel,
}: PostProviderProps) {
  const { postId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"reply" | "clone">("reply");

  const { isOpen, openViewer, closeViewer } = useContentViewerContext();

  function togglePostModal(open?: boolean, action?: "reply" | "clone") {
    setIsModalOpen(open ?? !isModalOpen);
    setAction(action ?? "reply");
  }

  function onPostClick(event?: PostClickEvent) {
    if (isNavigationDisabled) return;

    const eventPayload = event?.payload;

    const isNavigationDisabledElement = navigationDisabledElementSelectors.some((selector) =>
      (event?.target as HTMLElement)?.closest(selector),
    );

    if (!eventPayload && isNavigationDisabledElement) return;

    // Navigate to thread page if not already there
    const pushPath = `/@${post.user?.username}/thread/${post.id}` as `/${string}/thread/${string}`;
    if (pathname !== pushPath) {
      router.push(pushPath);
    }

    // If content items are provided, open viewer
    if (eventPayload?.contentItems && eventPayload.contentItems.length > 0) {
      const initialIndex = eventPayload.index ?? 0;
      openViewer(eventPayload.contentItems, post.id ?? "", initialIndex);
    }

    // If modal is open and no content items provided, check if post has viewable content
    if (isOpen && !eventPayload?.contentItems) {
      const contentItems = getAllContentFromMarkdown({
        markdown: post.content ?? "",
        postId: post.id ?? "",
      });

      if (contentItems.length > 0) return openViewer(contentItems, post.id, 0);
      closeViewer();
    }
  }

  return (
    <PostContext.Provider
      value={{
        post,
        isNavigationDisabled,
        isThread,
        isFirstInThread,
        isLastInThread,
        isThreadPagePost: !isNavigationDisabled && post.id === postId,
        togglePostModal,
        minVisibleContentLength,
        charsPerLevel,
        onPostClick,
      }}
    >
      {children}
      {isModalOpen && (
        <PostActionModal
          post={post}
          isOpen={isModalOpen}
          onOpenChange={togglePostModal}
          action={action}
        />
      )}
    </PostContext.Provider>
  );
}

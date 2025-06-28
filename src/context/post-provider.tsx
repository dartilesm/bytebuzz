"use client";

import { PostActionModal } from "@/components/post/post-action-modal";
import type { NestedPost } from "@/types/nested-posts";
import { useParams } from "next/navigation";
import { createContext, useState } from "react";

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
  togglePostModal: (isOpen?: boolean, action?: "reply" | "clone") => void;
}

export const PostContext = createContext<PostContextType>({} as PostContextType);

export interface PostProviderProps {
  children: React.ReactNode;
  post: NestedPost;
  isNavigationDisabled?: boolean;
  isThread?: boolean;
  isFirstInThread?: boolean;
  isLastInThread?: boolean;
}

export function PostProvider({
  children,
  isNavigationDisabled = false,
  post,
  isThread,
  isFirstInThread,
  isLastInThread,
}: PostProviderProps) {
  const { postId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"reply" | "clone">("reply");

  function togglePostModal(isOpen?: boolean, action: "reply" | "clone" = "reply") {
    setIsModalOpen(isOpen ?? !isModalOpen);
    setAction(action);
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
